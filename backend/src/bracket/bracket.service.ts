import { Injectable, Logger } from '@nestjs/common';
import { MatchStatus, StageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface TeamStat {
  teamId: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

interface KoMatch {
  id: string;
  matchNumber: number | null;
  homeSlot: string | null;
  awaySlot: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
}

/**
 * Resuelve el cuadro de eliminación usando la ESTRUCTURA OFICIAL de las llaves:
 * cada cruce está definido por posiciones de grupo (1A, 2B, 3 de un set de
 * grupos) y por ganadores de partidos previos (W74, L101). Los equipos se
 * completan a partir de las posiciones reales de cada grupo y se propagan
 * ronda a ronda. Idempotente.
 */
@Injectable()
export class BracketService {
  private readonly logger = new Logger(BracketService.name);

  constructor(private readonly prisma: PrismaService) {}

  async resolveAndPropagate(): Promise<void> {
    const tournament = await this.prisma.tournament.findFirst({
      orderBy: { season: 'desc' },
    });
    if (!tournament) return;

    // sólo resolvemos cuando la fase de grupos terminó
    const [total, finished] = await Promise.all([
      this.prisma.match.count({ where: { tournamentId: tournament.id, stage: { type: StageType.GROUP } } }),
      this.prisma.match.count({ where: { tournamentId: tournament.id, stage: { type: StageType.GROUP }, status: MatchStatus.FINISHED } }),
    ]);
    if (total === 0 || finished < total) return;

    const standings = await this.computeGroupStandings(tournament.id);

    // 1°, 2° y 3° de cada grupo
    const winners = new Map<string, string>();
    const runners = new Map<string, string>();
    const thirds: TeamStat[] = [];
    for (const [letter, ranked] of standings) {
      if (ranked[0]) winners.set(letter, ranked[0].teamId);
      if (ranked[1]) runners.set(letter, ranked[1].teamId);
      if (ranked[2]) thirds.push(ranked[2]);
    }
    // 8 mejores terceros
    const best8 = [...thirds]
      .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf)
      .slice(0, 8);

    const koMatches: KoMatch[] = await this.prisma.match.findMany({
      where: { tournamentId: tournament.id, stage: { type: { not: StageType.GROUP } } },
      orderBy: { matchNumber: 'asc' },
      select: {
        id: true, matchNumber: true, homeSlot: true, awaySlot: true,
        homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true, status: true,
      },
    });

    // asignación de los mejores terceros a las llaves "3X/Y/Z" (matching válido)
    const thirdAssignment = this.assignThirds(koMatches, best8);

    const byNumber = new Map<number, KoMatch>();
    for (const m of koMatches) if (m.matchNumber != null) byNumber.set(m.matchNumber, m);

    const winnerOf = (n: number): string | null => {
      const m = byNumber.get(n);
      if (!m || m.status !== MatchStatus.FINISHED || m.homeScore === null || m.awayScore === null) return null;
      return m.awayScore > m.homeScore ? m.awayTeamId : m.homeTeamId; // empate → local
    };
    const loserOf = (n: number): string | null => {
      const m = byNumber.get(n);
      if (!m || m.status !== MatchStatus.FINISHED || m.homeScore === null || m.awayScore === null) return null;
      return m.awayScore > m.homeScore ? m.homeTeamId : m.awayTeamId;
    };
    const resolve = (slot: string | null, slotKey: string): string | null => {
      if (!slot) return null;
      let mt: RegExpMatchArray | null;
      if ((mt = slot.match(/^1([A-L])$/))) return winners.get(mt[1]) ?? null;
      if ((mt = slot.match(/^2([A-L])$/))) return runners.get(mt[1]) ?? null;
      if (/^3/.test(slot)) return thirdAssignment.get(slotKey) ?? null;
      if ((mt = slot.match(/^W(\d+)$/i))) return winnerOf(Number(mt[1]));
      if ((mt = slot.match(/^L(\d+)$/i))) return loserOf(Number(mt[1]));
      return null;
    };

    // resolver en orden de número de partido (así W{n} de rondas previas ya están listos)
    for (const m of koMatches) {
      const home = resolve(m.homeSlot, `${m.id}:home`);
      const away = resolve(m.awaySlot, `${m.id}:away`);
      if (m.status === MatchStatus.FINISHED) continue;
      if (m.homeTeamId === home && m.awayTeamId === away) continue;
      await this.prisma.match.update({ where: { id: m.id }, data: { homeTeamId: home, awayTeamId: away } });
      m.homeTeamId = home;
      m.awayTeamId = away;
    }
    this.logger.log('Cuadro resuelto con la estructura oficial de llaves.');
  }

  // ── Posiciones de grupo ──────────────────────────────────────
  async computeGroupStandings(tournamentId: string): Promise<Map<string, TeamStat[]>> {
    const groups = await this.prisma.teamGroup.findMany({
      where: { tournamentId }, include: { teams: true }, orderBy: { name: 'asc' },
    });
    const matches = await this.prisma.match.findMany({
      where: { tournamentId, stage: { type: StageType.GROUP }, status: MatchStatus.FINISHED },
    });

    const result = new Map<string, TeamStat[]>();
    for (const g of groups) {
      const stats = new Map<string, TeamStat>();
      for (const t of g.teams) {
        stats.set(t.id, { teamId: t.id, group: g.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 });
      }
      for (const m of matches) {
        if (m.teamGroupId !== g.id || m.homeTeamId === null || m.awayTeamId === null || m.homeScore === null || m.awayScore === null) continue;
        const h = stats.get(m.homeTeamId); const a = stats.get(m.awayTeamId);
        if (!h || !a) continue;
        h.played++; a.played++;
        h.gf += m.homeScore; h.ga += m.awayScore; a.gf += m.awayScore; a.ga += m.homeScore;
        if (m.homeScore > m.awayScore) { h.won++; h.points += 3; a.lost++; }
        else if (m.homeScore < m.awayScore) { a.won++; a.points += 3; h.lost++; }
        else { h.drawn++; a.drawn++; h.points++; a.points++; }
      }
      const ranked = [...stats.values()]
        .map((s) => ({ ...s, gd: s.gf - s.ga }))
        .sort((x, y) => y.points - x.points || y.gd - x.gd || y.gf - x.gf);
      result.set(g.name, ranked);
    }
    return result;
  }

  /**
   * Asigna los 8 mejores terceros a las 8 llaves "3X/Y/Z", respetando que cada
   * tercero sólo puede ir a una llave cuyo set de grupos lo contenga (matching
   * bipartito). Es una asignación válida según los sets oficiales.
   */
  private assignThirds(koMatches: KoMatch[], best8: TeamStat[]): Map<string, string> {
    const slots: { key: string; allowed: Set<string> }[] = [];
    for (const m of koMatches) {
      if (m.homeSlot && /^3/.test(m.homeSlot)) slots.push({ key: `${m.id}:home`, allowed: this.parseGroups(m.homeSlot) });
      if (m.awaySlot && /^3/.test(m.awaySlot)) slots.push({ key: `${m.id}:away`, allowed: this.parseGroups(m.awaySlot) });
    }
    // matching de Kuhn: third (índice) → slot (índice)
    const matchSlot: (number | null)[] = slots.map(() => null); // slot -> thirdIndex
    const tryAssign = (ti: number, seen: boolean[]): boolean => {
      for (let si = 0; si < slots.length; si++) {
        if (seen[si]) continue;
        if (!slots[si].allowed.has(best8[ti].group)) continue;
        seen[si] = true;
        if (matchSlot[si] === null || tryAssign(matchSlot[si]!, seen)) {
          matchSlot[si] = ti;
          return true;
        }
      }
      return false;
    };
    for (let ti = 0; ti < best8.length; ti++) tryAssign(ti, slots.map(() => false));

    const out = new Map<string, string>();
    slots.forEach((s, si) => {
      const ti = matchSlot[si];
      if (ti !== null) out.set(s.key, best8[ti].teamId);
    });
    return out;
  }

  private parseGroups(slot: string): Set<string> {
    // "3A/B/C/D/F" → {A,B,C,D,F}
    return new Set(slot.replace(/^3/, '').split('/').map((s) => s.trim()).filter(Boolean));
  }
}

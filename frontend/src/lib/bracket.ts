import type { Match } from './types';

type Scores = Record<string, { home: number | ''; away: number | '' }>;

interface Stat {
  teamId: string;
  group: string;
  pts: number;
  gd: number;
  gf: number;
}

export interface DerivedSlot {
  home: string | null;
  away: string | null;
}

/**
 * Resuelve el cuadro de eliminación DERIVADO de los pronósticos del usuario,
 * usando la estructura oficial de llaves (slots 1A/2B/3X/Y/Z y ganadores W{n}).
 * Devuelve, por matchId de eliminatoria, los teamIds previstos para cada lado.
 * Mismo algoritmo que el backend, pero sobre los marcadores que el usuario cargó.
 */
export function resolveDerivedBracket(
  matches: Match[],
  scores: Scores,
): Map<string, DerivedSlot> {
  const out = new Map<string, DerivedSlot>();
  if (!matches.length) return out;

  // ── posiciones de grupo a partir de los marcadores cargados ──
  const statsByGroup = new Map<string, Map<string, Stat>>();
  const ensure = (group: string, teamId: string) => {
    if (!statsByGroup.has(group)) statsByGroup.set(group, new Map());
    const g = statsByGroup.get(group)!;
    if (!g.has(teamId)) g.set(teamId, { teamId, group, pts: 0, gd: 0, gf: 0 });
    return g.get(teamId)!;
  };
  for (const m of matches) {
    if (m.stage.type !== 'GROUP') continue;
    const group = m.teamGroup?.name;
    if (!group || !m.homeTeam || !m.awayTeam) continue;
    ensure(group, m.homeTeam.id);
    ensure(group, m.awayTeam.id);
    const s = scores[m.id];
    if (!s || s.home === '' || s.away === '') continue;
    const h = Number(s.home), a = Number(s.away);
    const hs = ensure(group, m.homeTeam.id), as = ensure(group, m.awayTeam.id);
    hs.gf += h; hs.gd += h - a; as.gf += a; as.gd += a - h;
    if (h > a) hs.pts += 3; else if (a > h) as.pts += 3; else { hs.pts++; as.pts++; }
  }

  const winners = new Map<string, string>();
  const runners = new Map<string, string>();
  const thirds: Stat[] = [];
  for (const m of statsByGroup.values()) {
    const r = [...m.values()].sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf);
    if (r[0]) winners.set(r[0].group, r[0].teamId);
    if (r[1]) runners.set(r[1].group, r[1].teamId);
    if (r[2]) thirds.push(r[2]);
  }
  const best8 = [...thirds].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf).slice(0, 8);

  const ko = matches
    .filter((m) => m.stage.type !== 'GROUP')
    .sort((a, b) => (a.matchNumber ?? 0) - (b.matchNumber ?? 0));

  // ── asignación de mejores terceros a slots "3X/Y/Z" (matching) ──
  const parseGroups = (slot: string) =>
    new Set(slot.replace(/^3/, '').split('/').map((s) => s.trim()).filter(Boolean));
  const slots: { key: string; allowed: Set<string> }[] = [];
  for (const m of ko) {
    if (m.homeSlot && /^3/.test(m.homeSlot)) slots.push({ key: `${m.id}:home`, allowed: parseGroups(m.homeSlot) });
    if (m.awaySlot && /^3/.test(m.awaySlot)) slots.push({ key: `${m.id}:away`, allowed: parseGroups(m.awaySlot) });
  }
  const matchSlot: (number | null)[] = slots.map(() => null);
  const tryAssign = (ti: number, seen: boolean[]): boolean => {
    for (let si = 0; si < slots.length; si++) {
      if (seen[si] || !slots[si].allowed.has(best8[ti].group)) continue;
      seen[si] = true;
      if (matchSlot[si] === null || tryAssign(matchSlot[si]!, seen)) {
        matchSlot[si] = ti;
        return true;
      }
    }
    return false;
  };
  for (let ti = 0; ti < best8.length; ti++) tryAssign(ti, slots.map(() => false));
  const thirdAssign = new Map<string, string>();
  slots.forEach((s, si) => {
    const ti = matchSlot[si];
    if (ti !== null) thirdAssign.set(s.key, best8[ti].teamId);
  });

  const byNumber = new Map<number, Match>();
  for (const m of ko) if (m.matchNumber != null) byNumber.set(m.matchNumber, m);

  const sideOf = (n: number, loser: boolean): string | null => {
    const m = byNumber.get(n);
    if (!m) return null;
    const d = out.get(m.id);
    const s = scores[m.id];
    if (!d || !d.home || !d.away || !s || s.home === '' || s.away === '') return null;
    const h = Number(s.home), a = Number(s.away);
    const win = a > h ? d.away : d.home;
    const lose = a > h ? d.home : d.away;
    return loser ? lose : win;
  };
  const resolve = (slot: string | null, key: string): string | null => {
    if (!slot) return null;
    let mt: RegExpMatchArray | null;
    if ((mt = slot.match(/^1([A-L])$/))) return winners.get(mt[1]) ?? null;
    if ((mt = slot.match(/^2([A-L])$/))) return runners.get(mt[1]) ?? null;
    if (/^3/.test(slot)) return thirdAssign.get(key) ?? null;
    if ((mt = slot.match(/^W(\d+)$/i))) return sideOf(Number(mt[1]), false);
    if ((mt = slot.match(/^L(\d+)$/i))) return sideOf(Number(mt[1]), true);
    return null;
  };

  // resolver en orden de número de partido (W{n} de rondas previas ya resueltos)
  for (const m of ko) {
    out.set(m.id, {
      home: resolve(m.homeSlot, `${m.id}:home`),
      away: resolve(m.awaySlot, `${m.id}:away`),
    });
  }
  return out;
}

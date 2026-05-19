import { Injectable } from '@nestjs/common';
import { MatchStatus, ScoreReason, StageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PUBLIC_USER_SELECT } from '../users/users.types';
import { SCORING } from '../common/constants/scoring.constants';

/** Fases del prode, en orden, con las etapas (StageType) que cada una agrupa. */
const PHASE_DEFS: { key: string; label: string; stages: StageType[] }[] = [
  { key: 'GROUP', label: 'Grupos', stages: [StageType.GROUP] },
  { key: 'ROUND_OF_32', label: 'Dieciseisavos', stages: [StageType.ROUND_OF_32] },
  { key: 'ROUND_OF_16', label: 'Octavos', stages: [StageType.ROUND_OF_16] },
  { key: 'QUARTER_FINAL', label: 'Cuartos', stages: [StageType.QUARTER_FINAL] },
  { key: 'SEMI_FINAL', label: 'Semis', stages: [StageType.SEMI_FINAL] },
  {
    key: 'FINAL',
    label: 'Final y 3°',
    stages: [StageType.FINAL, StageType.THIRD_PLACE],
  },
];

@Injectable()
export class RankingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Group leaderboard ordered by rank. */
  getGroupRanking(groupId: string) {
    return this.prisma.standing.findMany({
      where: { groupId },
      orderBy: [{ rank: 'asc' }, { points: 'desc' }],
      include: { user: { select: PUBLIC_USER_SELECT } },
    });
  }

  /**
   * Per-matchday ranking: how many points each group member earned on a
   * specific group-stage matchday, ordered high → low.
   */
  async getMatchdayRanking(groupId: string, matchday: number) {
    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      include: { user: { select: PUBLIC_USER_SELECT } },
    });

    const rows = await Promise.all(
      members.map(async (m) => {
        const agg = await this.prisma.scoreHistory.aggregate({
          where: { userId: m.userId, matchday },
          _sum: { points: true },
        });
        const exact = await this.prisma.scoreHistory.count({
          where: { userId: m.userId, matchday, reason: 'EXACT_RESULT' },
        });
        return {
          user: m.user,
          points: agg._sum.points ?? 0,
          exactHits: exact,
        };
      }),
    );

    return rows
      .sort((a, b) => b.points - a.points || b.exactHits - a.exactHits)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }

  /**
   * Ranking POR FASE: para cada fase del prode (Grupos, Dieciseisavos, Octavos,
   * Cuartos, Semis, Final+3° y Campeón) devuelve la tabla de puntos de cada
   * miembro del grupo. El Campeón se computa aparte (no vive en ScoreHistory).
   */
  async getPhaseRankings(groupId: string) {
    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      include: { user: { select: PUBLIC_USER_SELECT } },
    });
    const userIds = members.map((m) => m.userId);

    const history = await this.prisma.scoreHistory.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, points: true, reason: true, stageType: true },
    });

    // Campeón resuelto (solo si la final ya se jugó con ganador).
    const final = await this.prisma.match.findFirst({
      where: { stage: { type: StageType.FINAL }, status: MatchStatus.FINISHED },
    });
    let championTeamId: string | null = null;
    if (final && final.homeScore !== null && final.awayScore !== null) {
      if (final.homeScore > final.awayScore) championTeamId = final.homeTeamId;
      else if (final.awayScore > final.homeScore)
        championTeamId = final.awayTeamId;
    }
    const preds = await this.prisma.prediction.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, championTeamId: true },
    });
    const champByUser = new Map(preds.map((p) => [p.userId, p.championTeamId]));

    const rankRows = <T extends { points: number; exactHits: number }>(
      rows: T[],
    ) =>
      [...rows]
        .sort((a, b) => b.points - a.points || b.exactHits - a.exactHits)
        .map((r, i) => ({ ...r, rank: i + 1 }));

    const phases = PHASE_DEFS.map((phase) => {
      const rows = members.map((m) => {
        const hs = history.filter(
          (h) =>
            h.userId === m.userId &&
            h.stageType &&
            phase.stages.includes(h.stageType),
        );
        return {
          user: m.user,
          points: hs.reduce((s, h) => s + h.points, 0),
          exactHits: hs.filter((h) => h.reason === ScoreReason.EXACT_RESULT)
            .length,
        };
      });
      return { key: phase.key, label: phase.label, rows: rankRows(rows) };
    });

    const champRows = members.map((m) => {
      const hit =
        !!championTeamId && champByUser.get(m.userId) === championTeamId;
      return { user: m.user, points: hit ? SCORING.CHAMPION : 0, exactHits: 0 };
    });
    phases.push({
      key: 'CHAMPION',
      label: 'Campeón',
      rows: rankRows(champRows),
    });

    return phases;
  }
}

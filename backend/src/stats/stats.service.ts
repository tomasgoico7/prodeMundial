import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PUBLIC_USER_SELECT, PublicUser } from '../users/users.types';

export interface LeaderEntry {
  user: PublicUser;
  value: number;
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGroupStats(groupId: string) {
    const standings = await this.prisma.standing.findMany({
      where: { groupId },
      include: { user: { select: PUBLIC_USER_SELECT } },
    });

    const memberIds = standings.map((s) => s.userId);

    const predictions = await this.prisma.prediction.findMany({
      where: { userId: { in: memberIds } },
      include: { championTeam: true, matches: true },
    });
    const predByUser = new Map(predictions.map((p) => [p.userId, p]));

    // Líderes (mostrando TODOS los empatados en el máximo)
    const maxPoints = standings.reduce((m, s) => Math.max(m, s.points), 0);
    const topPoints =
      maxPoints > 0
        ? { users: standings.filter((s) => s.points === maxPoints).map((s) => s.user), value: maxPoints }
        : null;

    const maxExact = standings.reduce((m, s) => Math.max(m, s.exactHits), 0);
    const topExact =
      maxExact > 0
        ? { users: standings.filter((s) => s.exactHits === maxExact).map((s) => s.user), value: maxExact }
        : null;

    const tiedAtTop = standings
      .filter((s) => s.points === maxPoints && maxPoints > 0)
      .map((s) => s.user);

    // Accuracy % per member: (exact + outcome) / matches predicted
    const accuracy = standings.map((s) => {
      const pred = predByUser.get(s.userId);
      const predicted = pred?.matches.length ?? 0;
      const hits = s.exactHits + s.outcomeHits;
      return {
        user: s.user,
        predicted,
        hits,
        percentage: predicted ? Math.round((hits / predicted) * 100) : 0,
      };
    });

    // Champion distribution among members
    const championCounts = new Map<
      string,
      {
        team: { id: string; name: string; code: string; flag: string | null };
        votes: number;
      }
    >();
    for (const p of predictions) {
      if (!p.championTeam) continue;
      const key = p.championTeam.id;
      const entry =
        championCounts.get(key) ??
        {
          team: {
            id: p.championTeam.id,
            name: p.championTeam.name,
            code: p.championTeam.code,
            flag: p.championTeam.flag,
          },
          votes: 0,
        };
      entry.votes++;
      championCounts.set(key, entry);
    }
    const championVotes = [...championCounts.values()].sort(
      (a, b) => b.votes - a.votes,
    );
    // Campeón(es) más elegido(s): TODOS los que comparten el máximo de votos
    const maxVotes = championVotes[0]?.votes ?? 0;
    const mostChosenChampion =
      maxVotes > 0
        ? { teams: championVotes.filter((c) => c.votes === maxVotes).map((c) => c.team), votes: maxVotes }
        : null;

    return {
      memberCount: standings.length,
      topPoints,
      topExact,
      tiedAtTop,
      accuracy: accuracy.sort((a, b) => b.percentage - a.percentage),
      mostChosenChampion,
      championDistribution: championVotes,
      totalPredictionsLocked: predictions.filter((p) => p.locked).length,
    };
  }
}

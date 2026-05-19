import { Injectable } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const [upcoming, prediction, memberships] = await Promise.all([
      this.prisma.match.findMany({
        where: { status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] } },
        orderBy: { kickoff: 'asc' },
        take: 12,
        include: { homeTeam: true, awayTeam: true, stage: true, teamGroup: true },
      }),
      this.prisma.prediction.findUnique({
        where: { userId },
        include: { championTeam: true, matches: true },
      }),
      this.prisma.groupMember.findMany({
        where: { userId },
        include: {
          group: { include: { _count: { select: { members: true } } } },
        },
      }),
    ]);

    // Global stats from the user's prediction
    let points = 0;
    let exactHits = 0;
    let outcomeHits = 0;
    for (const m of prediction?.matches ?? []) {
      points += m.pointsAwarded;
      if (m.isExact) exactHits++;
      else if (m.isOutcome) outcomeHits++;
    }

    // Per-group standing
    const groups = await Promise.all(
      memberships.map(async (m) => {
        const standing = await this.prisma.standing.findUnique({
          where: { groupId_userId: { groupId: m.groupId, userId } },
        });
        return {
          id: m.group.id,
          name: m.group.name,
          inviteCode: m.group.inviteCode,
          memberCount: m.group._count.members,
          rank: standing?.rank ?? 0,
          points: standing?.points ?? points,
        };
      }),
    );

    return {
      upcoming,
      prediction: {
        locked: prediction?.locked ?? false,
        phasesLocked: prediction?.lockedPhases.length ?? 0,
        totalPhases: 6,
        champion: prediction?.championTeam ?? null,
        matchesPredicted: prediction?.matches.length ?? 0,
      },
      score: { points, exactHits, outcomeHits },
      groups,
    };
  }
}

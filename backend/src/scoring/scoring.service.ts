import { Injectable, Logger } from '@nestjs/common';
import { MatchStatus, ScoreReason, StageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  SCORING,
  evaluateMatchPrediction,
} from '../common/constants/scoring.constants';

/**
 * Owns all point calculation. Whenever a result lands, the platform calls
 * `recalculateMatch` for that match and then `rebuildStandings` to refresh
 * every group leaderboard. Both are idempotent — safe to re-run any time.
 */
@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Re-evaluate every user's prediction for a single finished match.
   * Writes per-match points back onto PredictionMatch and refreshes the
   * audit trail (ScoreHistory) used by the per-matchday ranking.
   */
  async recalculateMatch(matchId: string): Promise<void> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { predictions: { include: { prediction: true } }, stage: true },
    });

    if (
      !match ||
      match.status !== MatchStatus.FINISHED ||
      match.homeScore === null ||
      match.awayScore === null
    ) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      // wipe prior history for this match so recalculation stays idempotent
      await tx.scoreHistory.deleteMany({ where: { matchId } });

      for (const pm of match.predictions) {
        const { outcome, points } = evaluateMatchPrediction(
          pm.homeScore,
          pm.awayScore,
          match.homeScore!,
          match.awayScore!,
        );

        await tx.predictionMatch.update({
          where: { id: pm.id },
          data: {
            pointsAwarded: points,
            isExact: outcome === 'EXACT',
            isOutcome: outcome === 'OUTCOME',
          },
        });

        if (points > 0) {
          await tx.scoreHistory.create({
            data: {
              userId: pm.prediction.userId,
              matchId,
              reason:
                outcome === 'EXACT'
                  ? ScoreReason.EXACT_RESULT
                  : ScoreReason.CORRECT_OUTCOME,
              points,
              matchday: match.matchday,
              stageType: match.stage.type,
            },
          });
        }
      }
    });

    this.logger.log(
      `Recalculated match ${matchId} (${match.predictions.length} predictions)`,
    );
  }

  /**
   * Resolve the champion if the Final is finished, award champion points,
   * then recompute every group's standing rows and ranks.
   */
  async rebuildStandings(): Promise<void> {
    const championTeamId = await this.resolveChampion();

    const predictions = await this.prisma.prediction.findMany({
      include: { matches: true },
    });

    // userId -> aggregated stats
    const stats = new Map<
      string,
      {
        points: number;
        exactHits: number;
        outcomeHits: number;
        championHit: boolean;
      }
    >();

    for (const p of predictions) {
      let points = 0;
      let exactHits = 0;
      let outcomeHits = 0;
      for (const m of p.matches) {
        points += m.pointsAwarded;
        if (m.isExact) exactHits++;
        else if (m.isOutcome) outcomeHits++;
      }
      const championHit =
        !!championTeamId && p.championTeamId === championTeamId;
      if (championHit) points += SCORING.CHAMPION;

      stats.set(p.userId, { points, exactHits, outcomeHits, championHit });
    }

    const groups = await this.prisma.group.findMany({
      include: { members: true },
    });

    for (const group of groups) {
      // upsert each member's standing
      for (const member of group.members) {
        const s = stats.get(member.userId) ?? {
          points: 0,
          exactHits: 0,
          outcomeHits: 0,
          championHit: false,
        };
        await this.prisma.standing.upsert({
          where: {
            groupId_userId: { groupId: group.id, userId: member.userId },
          },
          update: { ...s, rank: 0 },
          create: { groupId: group.id, userId: member.userId, ...s, rank: 0 },
        });
      }

      // recompute ranks (points desc, then exact hits desc)
      const standings = await this.prisma.standing.findMany({
        where: { groupId: group.id },
        orderBy: [{ points: 'desc' }, { exactHits: 'desc' }],
      });
      let rank = 0;
      let prevPoints = Number.NaN;
      let prevExact = Number.NaN;
      let processed = 0;
      for (const st of standings) {
        processed++;
        if (st.points !== prevPoints || st.exactHits !== prevExact) {
          rank = processed; // standard competition ranking (ties share rank)
          prevPoints = st.points;
          prevExact = st.exactHits;
        }
        await this.prisma.standing.update({
          where: { id: st.id },
          data: { rank },
        });
      }
    }

    this.logger.log(`Rebuilt standings for ${groups.length} groups`);
  }

  /** Recalculate everything from scratch (used after bulk result updates). */
  async recalculateAll(): Promise<void> {
    const finished = await this.prisma.match.findMany({
      where: { status: MatchStatus.FINISHED },
      select: { id: true },
    });
    for (const m of finished) {
      await this.recalculateMatch(m.id);
    }
    await this.rebuildStandings();
  }

  private async resolveChampion(): Promise<string | null> {
    const final = await this.prisma.match.findFirst({
      where: { stage: { type: StageType.FINAL }, status: MatchStatus.FINISHED },
    });
    if (
      !final ||
      final.homeScore === null ||
      final.awayScore === null ||
      (!final.homeTeamId && !final.awayTeamId)
    ) {
      return null;
    }
    if (final.homeScore > final.awayScore) return final.homeTeamId;
    if (final.awayScore > final.homeScore) return final.awayTeamId;
    return null; // a drawn final would be decided on penalties (not modeled)
  }
}

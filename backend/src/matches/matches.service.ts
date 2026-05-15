import { Inject, Injectable, Logger } from '@nestjs/common';
import { MatchStatus, StageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  FOOTBALL_PROVIDER,
  FootballProvider,
} from '../football/football-provider.interface';
import { ScoringService } from '../scoring/scoring.service';
import { BracketService } from '../bracket/bracket.service';
import { NotificationsService } from '../notifications/notifications.service';

const MATCH_INCLUDE = {
  homeTeam: true,
  awayTeam: true,
  stage: true,
  teamGroup: true,
} as const;

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: ScoringService,
    private readonly bracket: BracketService,
    private readonly notifications: NotificationsService,
    @Inject(FOOTBALL_PROVIDER) private readonly provider: FootballProvider,
  ) {}

  async getTournament() {
    const tournament = await this.prisma.tournament.findFirst({
      orderBy: { season: 'desc' },
      include: {
        groups: {
          orderBy: { name: 'asc' },
          include: { teams: { orderBy: { name: 'asc' } } },
        },
      },
    });
    const stages = await this.prisma.stage.findMany({
      orderBy: { order: 'asc' },
    });
    return { tournament, stages };
  }

  listTeams() {
    return this.prisma.team.findMany({
      orderBy: { name: 'asc' },
      include: { teamGroup: true },
    });
  }

  listMatches(params: { stage?: StageType; groupName?: string; matchday?: number }) {
    return this.prisma.match.findMany({
      where: {
        ...(params.stage ? { stage: { type: params.stage } } : {}),
        ...(params.groupName ? { teamGroup: { name: params.groupName } } : {}),
        ...(params.matchday ? { matchday: params.matchday } : {}),
      },
      orderBy: { kickoff: 'asc' },
      include: MATCH_INCLUDE,
    });
  }

  getUpcoming(limit = 8) {
    return this.prisma.match.findMany({
      where: { status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] } },
      orderBy: { kickoff: 'asc' },
      take: limit,
      include: MATCH_INCLUDE,
    });
  }

  /**
   * Manually set a match result (admin / demo). Marks it FINISHED and runs the
   * real scoring + ranking recalculation. Gated by ENABLE_ADMIN_RESULTS.
   */
  async setResult(matchId: string, homeScore: number, awayScore: number) {
    await this.prisma.match.update({
      where: { id: matchId },
      data: { status: MatchStatus.FINISHED, homeScore, awayScore },
    });
    await this.scoring.recalculateMatch(matchId);
    // Resolver/propagar el cuadro (llena octavos+ con los equipos reales) y
    // recién después recalcular standings (para que el campeón quede resuelto).
    await this.bracket.resolveAndPropagate();
    await this.scoring.rebuildStandings();
    // Aviso por email en segundo plano (no bloquea la respuesta del endpoint).
    void this.notifications.announceNewlyOpenPhases().catch(() => undefined);
    this.logger.log(`Manual result set for ${matchId}: ${homeScore}-${awayScore}`);
    return this.prisma.match.findUnique({
      where: { id: matchId },
      include: MATCH_INCLUDE,
    });
  }

  /**
   * Pull fresh results from the active provider, persist any changes, and
   * trigger score + ranking recalculation for matches that just finished.
   */
  async syncResults(): Promise<{ updated: number; finished: number }> {
    const pending = await this.prisma.match.findMany({
      where: { status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] } },
      select: { externalId: true, kickoff: true, status: true },
    });

    const candidates = pending.filter(
      (m): m is { externalId: string; kickoff: Date; status: MatchStatus } =>
        m.externalId !== null,
    );

    const updates = await this.provider.fetchResults(candidates);
    let finished = 0;

    for (const u of updates) {
      const match = await this.prisma.match.update({
        where: { externalId: u.externalId },
        data: {
          status: u.status,
          homeScore: u.homeScore,
          awayScore: u.awayScore,
        },
      });
      if (u.status === MatchStatus.FINISHED) {
        finished++;
        await this.scoring.recalculateMatch(match.id);
      }
    }

    if (finished > 0) {
      await this.bracket.resolveAndPropagate();
      await this.scoring.rebuildStandings();
      void this.notifications.announceNewlyOpenPhases().catch(() => undefined);
    }

    if (updates.length) {
      this.logger.log(
        `Synced ${updates.length} updates (${finished} finished) via ${this.provider.name}`,
      );
    }
    return { updated: updates.length, finished };
  }
}

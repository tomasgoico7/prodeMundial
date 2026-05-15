import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { MatchStatus } from '@prisma/client';
import {
  FootballProvider,
  MatchResultUpdate,
  PendingMatch,
} from './football-provider.interface';

/**
 * Adapter for API-Football (api-sports.io). Activated by setting
 * FOOTBALL_PROVIDER=api-football and supplying FOOTBALL_API_KEY.
 *
 * It maps the remote fixture status/score shape onto our domain model.
 * The rest of the app is unaware which provider is in use.
 */
@Injectable()
export class ApiFootballProvider implements FootballProvider {
  readonly name = 'api-football';
  private readonly logger = new Logger(ApiFootballProvider.name);
  private readonly http: AxiosInstance;

  constructor(config: ConfigService) {
    this.http = axios.create({
      baseURL: config.get<string>(
        'FOOTBALL_API_URL',
        'https://v3.football.api-sports.io',
      ),
      headers: {
        'x-apisports-key': config.get<string>('FOOTBALL_API_KEY', ''),
      },
      timeout: 10_000,
    });
  }

  async fetchResults(pending: PendingMatch[]): Promise<MatchResultUpdate[]> {
    const updates: MatchResultUpdate[] = [];
    for (const m of pending) {
      try {
        const { data } = await this.http.get('/fixtures', {
          params: { id: m.externalId },
        });
        const fixture = data?.response?.[0];
        if (!fixture) continue;
        updates.push({
          externalId: m.externalId,
          status: this.mapStatus(fixture.fixture?.status?.short),
          homeScore: fixture.goals?.home ?? null,
          awayScore: fixture.goals?.away ?? null,
        });
      } catch (err) {
        this.logger.warn(
          `Failed to fetch fixture ${m.externalId}: ${(err as Error).message}`,
        );
      }
    }
    return updates;
  }

  private mapStatus(short: string | undefined): MatchStatus {
    switch (short) {
      case 'FT':
      case 'AET':
      case 'PEN':
        return MatchStatus.FINISHED;
      case '1H':
      case '2H':
      case 'HT':
      case 'ET':
      case 'LIVE':
        return MatchStatus.LIVE;
      case 'PST':
        return MatchStatus.POSTPONED;
      case 'CANC':
        return MatchStatus.CANCELLED;
      default:
        return MatchStatus.SCHEDULED;
    }
  }
}

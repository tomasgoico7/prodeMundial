import { Injectable, Logger } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import {
  FootballProvider,
  MatchResultUpdate,
  PendingMatch,
} from './football-provider.interface';

/**
 * Built-in, offline provider. It requires no API key and lets the platform
 * run end-to-end out of the box: any match whose kickoff has passed is
 * "played", with a deterministic pseudo-random scoreline derived from its
 * externalId (so results are stable across restarts and recalculations).
 */
@Injectable()
export class StaticFootballProvider implements FootballProvider {
  readonly name = 'static';
  private readonly logger = new Logger(StaticFootballProvider.name);

  async fetchResults(pending: PendingMatch[]): Promise<MatchResultUpdate[]> {
    const now = Date.now();
    const updates: MatchResultUpdate[] = [];

    for (const m of pending) {
      if (m.status === MatchStatus.FINISHED) continue;
      const kickoff = m.kickoff.getTime();
      if (kickoff > now) continue; // not started yet

      const elapsedMs = now - kickoff;
      const fullMatchMs = 110 * 60 * 1000; // 90' + breaks
      const finished = elapsedMs >= fullMatchMs;

      const { home, away } = this.scoreFor(m.externalId);
      updates.push({
        externalId: m.externalId,
        status: finished ? MatchStatus.FINISHED : MatchStatus.LIVE,
        // While LIVE show a partial score, when finished show full
        homeScore: finished ? home : Math.min(home, this.partial(elapsedMs, home)),
        awayScore: finished ? away : Math.min(away, this.partial(elapsedMs, away)),
      });
    }

    if (updates.length) {
      this.logger.debug(`Static provider produced ${updates.length} updates`);
    }
    return updates;
  }

  private partial(elapsedMs: number, finalGoals: number): number {
    const fraction = Math.min(1, elapsedMs / (95 * 60 * 1000));
    return Math.floor(finalGoals * fraction);
  }

  /** Deterministic 0-4 scoreline from a string hash. */
  private scoreFor(seed: string): { home: number; away: number } {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const a = Math.abs(h);
    return { home: a % 4, away: Math.floor(a / 7) % 4 };
  }
}

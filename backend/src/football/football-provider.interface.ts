import { MatchStatus } from '@prisma/client';

/**
 * Abstraction over any football data source. Implement this interface to
 * plug in a new provider (api-football, sportmonks, a mock, ...) without
 * touching the rest of the application — dependency inversion in practice.
 */
export const FOOTBALL_PROVIDER = Symbol('FOOTBALL_PROVIDER');

export interface PendingMatch {
  externalId: string;
  kickoff: Date;
  status: MatchStatus;
}

export interface MatchResultUpdate {
  externalId: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
}

export interface FootballProvider {
  readonly name: string;

  /**
   * Given the set of matches the platform currently knows about, return the
   * subset that have new results / status changes.
   */
  fetchResults(pending: PendingMatch[]): Promise<MatchResultUpdate[]>;
}

/**
 * Centralized, configurable scoring system.
 *
 * Tweak these values to change how the whole platform scores predictions —
 * every recalculation reads from here, so there are no magic numbers
 * scattered across the codebase (DRY / single source of truth).
 */
export const SCORING = {
  /** Exact final score predicted correctly (e.g. predicted 2-0, result 2-0). */
  EXACT_RESULT: 3,
  /** Correct outcome only (right winner, or a draw when a draw happened). */
  CORRECT_OUTCOME: 1,
  /** Correctly picking the tournament champion. */
  CHAMPION: 10,
  /** No points. */
  NONE: 0,
} as const;

export type ScoreOutcome = 'EXACT' | 'OUTCOME' | 'MISS';

/**
 * Pure scoring function — given a prediction and an actual result, returns
 * the outcome classification and the points awarded.
 */
export function evaluateMatchPrediction(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
): { outcome: ScoreOutcome; points: number } {
  if (predHome === actualHome && predAway === actualAway) {
    return { outcome: 'EXACT', points: SCORING.EXACT_RESULT };
  }

  const predSign = Math.sign(predHome - predAway);
  const actualSign = Math.sign(actualHome - actualAway);
  if (predSign === actualSign) {
    return { outcome: 'OUTCOME', points: SCORING.CORRECT_OUTCOME };
  }

  return { outcome: 'MISS', points: SCORING.NONE };
}

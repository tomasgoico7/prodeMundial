import { SCORING, evaluateMatchPrediction } from './scoring.constants';

describe('evaluateMatchPrediction', () => {
  it('awards EXACT_RESULT points for a perfect scoreline', () => {
    expect(evaluateMatchPrediction(2, 0, 2, 0)).toEqual({
      outcome: 'EXACT',
      points: SCORING.EXACT_RESULT,
    });
  });

  it('awards CORRECT_OUTCOME points for the right winner but wrong score', () => {
    expect(evaluateMatchPrediction(2, 0, 3, 1)).toEqual({
      outcome: 'OUTCOME',
      points: SCORING.CORRECT_OUTCOME,
    });
  });

  it('awards CORRECT_OUTCOME points for predicting a draw correctly', () => {
    expect(evaluateMatchPrediction(1, 1, 2, 2)).toEqual({
      outcome: 'OUTCOME',
      points: SCORING.CORRECT_OUTCOME,
    });
  });

  it('awards nothing for the wrong outcome', () => {
    expect(evaluateMatchPrediction(2, 0, 0, 1)).toEqual({
      outcome: 'MISS',
      points: SCORING.NONE,
    });
  });

  it('treats a predicted draw vs a decisive result as a miss', () => {
    expect(evaluateMatchPrediction(1, 1, 2, 0)).toEqual({
      outcome: 'MISS',
      points: SCORING.NONE,
    });
  });
});

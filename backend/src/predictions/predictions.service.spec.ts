import { ForbiddenException } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PredictionsService', () => {
  let service: PredictionsService;
  let prisma: {
    prediction: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
    match: { findMany: jest.Mock };
    team: { findUnique: jest.Mock };
    predictionMatch: { upsert: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      prediction: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      match: { findMany: jest.fn() },
      team: { findUnique: jest.fn() },
      predictionMatch: { upsert: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    service = new PredictionsService(prisma as unknown as PrismaService);
  });

  it('refuses to save a draft once the prediction is locked', async () => {
    prisma.prediction.findUnique.mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      locked: true,
    });

    await expect(
      service.saveDraft('u1', {
        matches: [{ matchId: 'm1', homeScore: 1, awayScore: 0 }],
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('locks the prediction on confirm', async () => {
    prisma.prediction.findUnique
      .mockResolvedValueOnce({ id: 'p1', userId: 'u1', locked: false }) // ensureUnlocked
      .mockResolvedValue({ id: 'p1', userId: 'u1', locked: true, matches: [] }); // getMine
    prisma.match.findMany.mockResolvedValue([{ id: 'm1' }]);

    await service.confirm('u1', {
      matches: [{ matchId: 'm1', homeScore: 2, awayScore: 1 }],
    });

    expect(prisma.prediction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: expect.objectContaining({ locked: true }),
      }),
    );
  });
});

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { StageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitPredictionDto } from './dto/submit-prediction.dto';
import {
  PHASES,
  PhaseDef,
  buildStageInfo,
  computePhaseStatuses,
} from './phases';

const PREDICTION_INCLUDE = {
  championTeam: true,
  matches: { include: { match: { include: { homeTeam: true, awayTeam: true, stage: true } } } },
} as const;

@Injectable()
export class PredictionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async stageInfo() {
    const matches = await this.prisma.match.findMany({
      select: { status: true, kickoff: true, stage: { select: { type: true } } },
    });
    return buildStageInfo(matches);
  }

  async getMine(userId: string) {
    const prediction =
      (await this.prisma.prediction.findUnique({ where: { userId }, include: PREDICTION_INCLUDE })) ??
      (await this.prisma.prediction.create({ data: { userId }, include: PREDICTION_INCLUDE }));

    const phases = computePhaseStatuses(await this.stageInfo(), prediction.lockedPhases);
    return { ...prediction, phases };
  }

  async savePhase(userId: string, phaseKey: string, dto: SubmitPredictionDto) {
    const { prediction, phase } = await this.ensurePhaseOpen(userId, phaseKey);
    await this.validateAndPersist(prediction.id, phase, dto);
    return this.getMine(userId);
  }

  async confirmPhase(userId: string, phaseKey: string, dto: SubmitPredictionDto) {
    const { prediction, phase } = await this.ensurePhaseOpen(userId, phaseKey);
    await this.validateAndPersist(prediction.id, phase, dto);
    const locked = new Set<StageType>([...prediction.lockedPhases, phase.key as StageType]);
    await this.prisma.prediction.update({
      where: { id: prediction.id },
      data: { lockedPhases: [...locked] },
    });
    return this.getMine(userId);
  }

  private async ensurePhaseOpen(userId: string, phaseKey: string) {
    const phase = PHASES.find((p) => p.key === phaseKey);
    if (!phase) throw new BadRequestException(`Fase desconocida: ${phaseKey}`);

    const prediction =
      (await this.prisma.prediction.findUnique({ where: { userId } })) ??
      (await this.prisma.prediction.create({ data: { userId } }));

    const status = computePhaseStatuses(await this.stageInfo(), prediction.lockedPhases).find(
      (p) => p.key === phaseKey,
    )!.status;

    if (status === 'pending')
      throw new ForbiddenException('Esta fase todavía no se habilitó (falta que termine la ronda anterior).');
    if (status === 'closed')
      throw new ForbiddenException('Esta fase ya cerró: los partidos empezaron.');
    if (status === 'signed')
      throw new ForbiddenException('Ya firmaste esta fase, no se puede modificar.');

    return { prediction, phase };
  }

  private async validateAndPersist(predictionId: string, phase: PhaseDef, dto: SubmitPredictionDto) {
    const matchIds = dto.matches.map((m) => m.matchId);
    if (new Set(matchIds).size !== matchIds.length) {
      throw new BadRequestException('Partido duplicado en el pronóstico');
    }

    const matches = await this.prisma.match.findMany({
      where: { id: { in: matchIds } },
      select: { id: true, stage: { select: { type: true } } },
    });
    const valid = new Set(matches.map((m) => m.id));
    const wrongStage = matches.filter((m) => !phase.stages.includes(m.stage.type));
    const invalid = matchIds.filter((id) => !valid.has(id));
    if (invalid.length) throw new BadRequestException(`Partido(s) inexistente(s): ${invalid.join(', ')}`);
    if (wrongStage.length) throw new BadRequestException('Hay partidos que no corresponden a esta fase.');

    if (dto.championTeamId && phase.key !== 'GROUP') {
      throw new BadRequestException('El campeón se elige sólo en la fase de grupos.');
    }
    if (dto.championTeamId) {
      const team = await this.prisma.team.findUnique({ where: { id: dto.championTeamId } });
      if (!team) throw new BadRequestException('Equipo campeón inexistente');
    }

    await this.prisma.$transaction([
      ...(phase.key === 'GROUP'
        ? [this.prisma.prediction.update({ where: { id: predictionId }, data: { championTeamId: dto.championTeamId ?? null } })]
        : []),
      ...dto.matches.map((m) =>
        this.prisma.predictionMatch.upsert({
          where: { predictionId_matchId: { predictionId, matchId: m.matchId } },
          update: { homeScore: m.homeScore, awayScore: m.awayScore },
          create: { predictionId, matchId: m.matchId, homeScore: m.homeScore, awayScore: m.awayScore },
        }),
      ),
    ]);
  }
}

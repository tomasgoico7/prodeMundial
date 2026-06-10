import { MatchStatus, StageType } from '@prisma/client';

export type PhaseKey =
  | 'GROUP'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'FINAL';

export interface PhaseDef {
  key: PhaseKey;
  label: string;
  stages: StageType[];
  prev: PhaseKey | null;
}

// Fases del prode, en orden. La última cubre tercer puesto + final.
export const PHASES: PhaseDef[] = [
  { key: 'GROUP', label: 'Fase de grupos', stages: [StageType.GROUP], prev: null },
  { key: 'ROUND_OF_32', label: 'Dieciseisavos', stages: [StageType.ROUND_OF_32], prev: 'GROUP' },
  { key: 'ROUND_OF_16', label: 'Octavos', stages: [StageType.ROUND_OF_16], prev: 'ROUND_OF_32' },
  { key: 'QUARTER_FINAL', label: 'Cuartos', stages: [StageType.QUARTER_FINAL], prev: 'ROUND_OF_16' },
  { key: 'SEMI_FINAL', label: 'Semifinales', stages: [StageType.SEMI_FINAL], prev: 'QUARTER_FINAL' },
  { key: 'FINAL', label: 'Final y tercer puesto', stages: [StageType.THIRD_PLACE, StageType.FINAL], prev: 'SEMI_FINAL' },
];

/**
 * Devuelve la KEY de fase (la que se guarda en lockedPhases) a la que pertenece
 * una etapa. Ej: THIRD_PLACE y FINAL → 'FINAL'. Sirve para saber si el partido
 * pertenece a una fase que el usuario firmó.
 */
export function phaseKeyForStage(stage: StageType): StageType {
  const phase = PHASES.find((p) => p.stages.includes(stage));
  return (phase?.key ?? stage) as StageType;
}

export interface StageInfo {
  total: number;
  finished: number;
  minKickoff: Date | null;
}

export type PhaseStatus = 'pending' | 'open' | 'closed' | 'signed';

export interface PhaseView {
  key: PhaseKey;
  label: string;
  stages: StageType[];
  status: PhaseStatus;
  editable: boolean;
  startsAt: Date | null;
}

export function buildStageInfo(
  matches: { status: MatchStatus; kickoff: Date; stage: { type: StageType } }[],
): Map<StageType, StageInfo> {
  const map = new Map<StageType, StageInfo>();
  for (const m of matches) {
    const e = map.get(m.stage.type) ?? { total: 0, finished: 0, minKickoff: null };
    e.total++;
    if (m.status === MatchStatus.FINISHED) e.finished++;
    if (!e.minKickoff || m.kickoff < e.minKickoff) e.minKickoff = m.kickoff;
    map.set(m.stage.type, e);
  }
  return map;
}

export function computePhaseStatuses(
  info: Map<StageType, StageInfo>,
  lockedPhases: StageType[],
  now = Date.now(),
): PhaseView[] {
  const stageFinished = (st: StageType) => {
    const i = info.get(st);
    return !!i && i.total > 0 && i.finished === i.total;
  };
  const stageAnyFinished = (st: StageType) => {
    const i = info.get(st);
    return !!i && i.finished > 0;
  };
  return PHASES.map((p) => {
    const prevDone =
      p.prev === null || PHASES.find((x) => x.key === p.prev)!.stages.every(stageFinished);
    const kickoffs = p.stages.map((s) => info.get(s)?.minKickoff).filter(Boolean) as Date[];
    const startsAt = kickoffs.length
      ? new Date(Math.min(...kickoffs.map((d) => d.getTime())))
      : null;
    // La fase "arranca" (y se cierra para cargar) cuando llega su horario de
    // inicio O cuando ya hay al menos un partido jugado (resultado cargado).
    // Esto cubre la simulación: damos partidos por jugados antes de su fecha real.
    const started =
      (!!startsAt && now >= startsAt.getTime()) || p.stages.some(stageAnyFinished);
    const signed = lockedPhases.includes(p.key as StageType);
    const status: PhaseStatus = signed
      ? 'signed'
      : started
        ? 'closed'
        : prevDone
          ? 'open'
          : 'pending';
    return { key: p.key, label: p.label, stages: p.stages, status, editable: status === 'open', startsAt };
  });
}

import { Injectable, Logger } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import {
  FootballProvider,
  MatchResultUpdate,
  PendingMatch,
} from './football-provider.interface';

const OPENFOOTBALL_2026_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

interface OFScore {
  ft?: [number, number]; // tiempo reglamentario (90')
  et?: [number, number]; // tras alargue
  p?: [number, number]; // penales
}
interface OFMatch {
  score?: OFScore; // formato actual de openfootball
  score1?: number; // formato legacy (compat)
  score2?: number;
}
interface OFFile {
  matches: OFMatch[];
}

/**
 * Proveedor de resultados REALES y GRATUITOS (openfootball, dominio público,
 * sin API key). Relee el JSON oficial y publica los marcadores de los partidos
 * ya jugados. Los partidos importados tienen externalId `of2026-<índice>`,
 * que se corresponde con la posición en el array de openfootball.
 */
@Injectable()
export class OpenFootballProvider implements FootballProvider {
  readonly name = 'openfootball';
  private readonly logger = new Logger(OpenFootballProvider.name);

  async fetchResults(pending: PendingMatch[]): Promise<MatchResultUpdate[]> {
    let data: OFFile;
    try {
      const res = await fetch(OPENFOOTBALL_2026_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = (await res.json()) as OFFile;
    } catch (err) {
      this.logger.warn(`No se pudo bajar resultados: ${(err as Error).message}`);
      return [];
    }

    const updates: MatchResultUpdate[] = [];
    for (const m of pending) {
      const idx = Number(m.externalId.replace('of2026-', ''));
      if (!m.externalId.startsWith('of2026-') || Number.isNaN(idx)) continue;
      const src = data.matches?.[idx];
      if (!src) continue;
      // Formato actual: score.ft (90') / score.et (alargue). Tomamos el de
      // alargue si existe (define el ganador en eliminatorias) y si no, el de
      // los 90'. Compat con el formato viejo score1/score2.
      const pair: [number, number] | undefined =
        src.score?.et ??
        src.score?.ft ??
        (typeof src.score1 === 'number' && typeof src.score2 === 'number'
          ? [src.score1, src.score2]
          : undefined);
      if (pair && typeof pair[0] === 'number' && typeof pair[1] === 'number') {
        updates.push({
          externalId: m.externalId,
          status: MatchStatus.FINISHED,
          homeScore: pair[0],
          awayScore: pair[1],
        });
      }
    }
    if (updates.length) {
      this.logger.log(`openfootball: ${updates.length} resultados nuevos`);
    }
    return updates;
  }
}

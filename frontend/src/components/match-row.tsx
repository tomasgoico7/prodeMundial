import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Flag } from '@/components/flag';
import { formatMatchDay, formatMatchTime, cn } from '@/lib/utils';
import type { Match } from '@/lib/types';

export interface MatchPrediction {
  homeScore: number;
  awayScore: number;
  pointsAwarded?: number;
  isExact?: boolean;
  isOutcome?: boolean;
}

const STAGE_ES: Record<string, string> = {
  ROUND_OF_32: 'Dieciseisavos de final',
  ROUND_OF_16: 'Octavos de final',
  QUARTER_FINAL: 'Cuartos de final',
  SEMI_FINAL: 'Semifinal',
  THIRD_PLACE: 'Tercer puesto',
  FINAL: 'Final',
};

function teamLabel(name: string | null | undefined, fallback: string | null) {
  return name ?? fallback ?? 'A definir';
}

export function MatchRow({
  match,
  showDay = true,
  prediction,
}: {
  match: Match;
  showDay?: boolean;
  prediction?: MatchPrediction | null;
}) {
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const played = isLive || isFinished;

  const stageLabel = match.teamGroup
    ? `Fecha ${match.matchday ?? ''} · Grupo ${match.teamGroup.name}`.trim()
    : STAGE_ES[match.stage.type] ?? match.stage.name;

  // Resultado del pronóstico (sólo tiene sentido si el partido terminó)
  let predBadge: { text: string; variant: 'success' | 'default' | 'secondary' } | null =
    null;
  if (prediction && isFinished) {
    if (prediction.isExact) predBadge = { text: 'PLENO +3', variant: 'success' };
    else if (prediction.isOutcome) predBadge = { text: 'ACIERTO +1', variant: 'default' };
    else predBadge = { text: 'Sin puntos', variant: 'secondary' };
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-card/60 p-3 transition-colors',
        isLive ? 'border-destructive/50' : 'border-border/60',
      )}
    >
      {/* Etiqueta de fase */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
          {stageLabel}
        </span>
        {isLive && (
          <Badge variant="live" className="gap-1">
            ● EN VIVO
          </Badge>
        )}
      </div>

      {/* Marcador real */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Flag code={match.homeTeam?.code} name={match.homeTeam?.name} size="lg" />
          <span className="truncate text-sm font-bold uppercase tracking-tight">
            {teamLabel(match.homeTeam?.name, match.homeLabel)}
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-center px-1">
          {played ? (
            <span className="scoreboard text-lg">
              <span>{match.homeScore ?? 0}</span>
              <span className="text-sol">:</span>
              <span>{match.awayScore ?? 0}</span>
            </span>
          ) : (
            <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
              VS
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-bold uppercase tracking-tight">
            {teamLabel(match.awayTeam?.name, match.awayLabel)}
          </span>
          <Flag code={match.awayTeam?.code} name={match.awayTeam?.name} size="lg" />
        </div>
      </div>

      {/* Info: día · horario · estadio */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
        {showDay && (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3" /> {formatMatchDay(match.kickoff)}
          </span>
        )}
        <span className="inline-flex items-center gap-1 font-semibold text-foreground/80">
          <Clock className="h-3 w-3" /> {formatMatchTime(match.kickoff)}
        </span>
        {match.venue && (
          <span className="inline-flex min-w-0 max-w-full items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {match.venue}
              {match.city ? `, ${match.city}` : ''}
            </span>
          </span>
        )}
      </div>

      {/* Tu pronóstico */}
      {prediction && (
        <div className="mt-2 flex items-center justify-center gap-2 rounded-md bg-secondary/60 px-2 py-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-muted-foreground">
            Tu prode
          </span>
          <span className="font-display tabular-nums">
            {prediction.homeScore} : {prediction.awayScore}
          </span>
          {predBadge && (
            <Badge variant={predBadge.variant} className="ml-1">
              {predBadge.text}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

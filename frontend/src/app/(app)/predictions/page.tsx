'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Crown, Lock, Loader2, Save, Trophy, CalendarDays, Clock, MapPin, CheckCircle2, Hourglass,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useMyPrediction, useSavePhase, useConfirmPhase,
} from '@/features/predictions/use-prediction';
import { useTournament, useAllMatches } from '@/features/tournament/use-tournament';
import { Flag } from '@/components/flag';
import type { Match, Team, PredictionPhase } from '@/lib/types';
import { cn, formatMatchDay, formatMatchTime } from '@/lib/utils';

type ScoreMap = Record<string, { home: number | ''; away: number | '' }>;

const STAGE_ES: Record<string, string> = {
  ROUND_OF_32: 'Dieciseisavos de final', ROUND_OF_16: 'Octavos de final',
  QUARTER_FINAL: 'Cuartos de final', SEMI_FINAL: 'Semifinal',
  THIRD_PLACE: 'Tercer puesto', FINAL: 'Final',
};

const STATUS_BADGE: Record<string, { text: string; variant: 'accent' | 'success' | 'destructive' | 'secondary' }> = {
  open: { text: 'Abierta', variant: 'accent' },
  signed: { text: 'Firmada 🔒', variant: 'success' },
  closed: { text: 'Cerrada', variant: 'destructive' },
  pending: { text: 'Pendiente', variant: 'secondary' },
};

export default function PredictionsPage() {
  const { data: prediction, isLoading: loadingPred } = useMyPrediction();
  const { data: tournament } = useTournament();
  const { data: allMatches, isLoading: loadingMatches } = useAllMatches();
  const savePhase = useSavePhase();
  const confirmPhase = useConfirmPhase();

  const [scores, setScores] = useState<ScoreMap>({});
  const [champion, setChampion] = useState('');

  useEffect(() => {
    if (!prediction) return;
    const map: ScoreMap = {};
    for (const pm of prediction.matches) map[pm.matchId] = { home: pm.homeScore, away: pm.awayScore };
    setScores(map);
    setChampion(prediction.championTeamId ?? '');
  }, [prediction]);

  const phases = prediction?.phases ?? [];
  const groups = useMemo(() => tournament?.tournament?.groups ?? [], [tournament]);
  const allTeams: Team[] = useMemo(() => groups.flatMap((g) => g.teams), [groups]);

  const byStage = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of allMatches ?? []) map.set(m.stage.type, [...(map.get(m.stage.type) ?? []), m]);
    for (const arr of map.values()) arr.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
    return map;
  }, [allMatches]);

  const matchesByGroup = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of byStage.get('GROUP') ?? []) {
      const key = m.teamGroup?.name ?? '—';
      map.set(key, [...(map.get(key) ?? []), m]);
    }
    return map;
  }, [byStage]);

  function setScore(matchId: string, side: 'home' | 'away', value: string, locked: boolean) {
    if (locked) return;
    const n = value === '' ? '' : Math.max(0, Math.min(20, Number(value)));
    setScores((prev) => ({ ...prev, [matchId]: { home: prev[matchId]?.home ?? '', away: prev[matchId]?.away ?? '', [side]: n } }));
  }

  function phaseMatches(phase: PredictionPhase): Match[] {
    return phase.stages.flatMap((s) => byStage.get(s) ?? []).sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  }
  function phasePayload(phase: PredictionPhase) {
    const ms = phaseMatches(phase);
    const matches = ms
      .filter((m) => scores[m.id]?.home !== '' && scores[m.id]?.home !== undefined && scores[m.id]?.away !== '')
      .map((m) => ({ matchId: m.id, homeScore: Number(scores[m.id].home), awayScore: Number(scores[m.id].away) }));
    return { championTeamId: phase.key === 'GROUP' ? champion || undefined : undefined, matches };
  }

  if (loadingPred || loadingMatches) {
    return <div className="space-y-4"><Skeleton className="h-12 w-72" /><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl uppercase tracking-tight">Mi Planilla del Prode</h1>
        <p className="text-muted-foreground">
          El prode se juega <strong>por etapas</strong>. Cada fase se habilita cuando se
          conocen los rivales y se firma por separado. Empezás por grupos + campeón.
        </p>
      </div>

      {/* Stepper de fases */}
      <div className="flex flex-wrap gap-2">
        {phases.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() =>
              document
                .getElementById(`fase-${p.key}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide transition-all hover:scale-105 hover:brightness-110',
              p.status === 'open' && 'border-accent bg-accent/15 text-accent',
              p.status === 'signed' && 'border-pitch bg-pitch/15 text-pitch',
              p.status === 'closed' && 'border-destructive/50 text-destructive',
              p.status === 'pending' && 'border-border text-muted-foreground',
            )}
          >
            {p.status === 'signed' && <CheckCircle2 className="h-3 w-3" />}
            {p.status === 'pending' && <Hourglass className="h-3 w-3" />}
            {p.label}
          </button>
        ))}
      </div>

      {phases.map((phase) => (
        <PhaseCard
          key={phase.key}
          anchorId={`fase-${phase.key}`}
          phase={phase}
          groups={[...matchesByGroup.entries()]}
          phaseMatchList={phaseMatches(phase)}
          allTeams={allTeams}
          champion={champion}
          setChampion={setChampion}
          scores={scores}
          setScore={setScore}
          onSave={() => savePhase.mutate({ phase: phase.key, payload: phasePayload(phase) })}
          onConfirm={() => {
            if (window.confirm(`¿Firmás la fase "${phase.label}"? Queda cerrada y no la podés tocar más.`)) {
              confirmPhase.mutate({ phase: phase.key, payload: phasePayload(phase) });
            }
          }}
          saving={savePhase.isPending}
          confirming={confirmPhase.isPending}
          filledCount={phasePayload(phase).matches.length}
        />
      ))}
    </div>
  );
}

function PhaseCard({
  anchorId, phase, groups, phaseMatchList, allTeams, champion, setChampion, scores, setScore, onSave, onConfirm, saving, confirming, filledCount,
}: {
  anchorId: string;
  phase: PredictionPhase;
  groups: [string, Match[]][];
  phaseMatchList: Match[];
  allTeams: Team[];
  champion: string;
  setChampion: (id: string) => void;
  scores: ScoreMap;
  setScore: (id: string, side: 'home' | 'away', v: string, locked: boolean) => void;
  onSave: () => void;
  onConfirm: () => void;
  saving: boolean;
  confirming: boolean;
  filledCount: number;
}) {
  const locked = !phase.editable;
  const badge = STATUS_BADGE[phase.status];
  const isGroup = phase.key === 'GROUP';
  const groupNames = groups.map(([g]) => g).sort();

  return (
    <Card id={anchorId} className={cn('scroll-mt-24', phase.status === 'open' && 'border-accent/50 ring-1 ring-accent/20')}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-sol" /> {phase.label}
        </CardTitle>
        <Badge variant={badge.variant}>{badge.text}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {phase.status === 'pending' ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            ⏳ Se habilita cuando termine la ronda anterior y se conozcan los rivales.
          </p>
        ) : (
          <>
            {/* Campeón (solo fase de grupos) */}
            {isGroup && (
              <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
                <div className="mb-2 flex items-center gap-2 font-display text-sm uppercase tracking-tight">
                  <Crown className="h-4 w-4 text-accent" /> ¿Quién levanta la Copa? <Badge variant="accent" className="ml-1">+10</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTeams.map((t) => (
                    <button key={t.id} disabled={locked} onClick={() => setChampion(t.id)}
                      className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all',
                        champion === t.id ? 'scale-105 border-accent bg-accent text-accent-foreground' : 'border-border bg-background hover:border-accent/50',
                        locked && 'cursor-not-allowed opacity-60')}>
                      <Flag code={t.code} name={t.name} size="sm" /> {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Partidos */}
            {isGroup ? (
              groupNames.length > 0 && (
                <Tabs defaultValue={groupNames[0]}>
                  <div className="overflow-x-auto pb-2"><TabsList>{groupNames.map((g) => <TabsTrigger key={g} value={g}>Grupo {g}</TabsTrigger>)}</TabsList></div>
                  {groups.map(([g, ms]) => (
                    <TabsContent key={g} value={g}>
                      <div className="space-y-3">
                        {ms.map((m) => <PredictionInput key={m.id} match={m} home={scores[m.id]?.home ?? ''} away={scores[m.id]?.away ?? ''} locked={locked} onChange={(id, s, v) => setScore(id, s, v, locked)} />)}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )
            ) : (
              <div className="space-y-3">
                {phaseMatchList.map((m) => <PredictionInput key={m.id} match={m} home={scores[m.id]?.home ?? ''} away={scores[m.id]?.away ?? ''} locked={locked} onChange={(id, s, v) => setScore(id, s, v, locked)} />)}
              </div>
            )}

            {/* Acciones de la fase */}
            {phase.editable && (
              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:gap-3">
                <Button variant="outline" className="w-full sm:flex-1" disabled={saving} onClick={onSave}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar borrador
                </Button>
                <Button variant="accent" className="w-full whitespace-normal sm:flex-1" disabled={confirming || filledCount === 0} onClick={onConfirm}>
                  {confirming ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Lock className="h-4 w-4 shrink-0" />} Firmar {phase.label}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PredictionInput({
  match, home, away, locked, onChange,
}: {
  match: Match; home: number | ''; away: number | ''; locked: boolean;
  onChange: (id: string, side: 'home' | 'away', v: string) => void;
}) {
  const finished = match.status === 'FINISHED';
  const homeName = match.homeTeam?.name ?? match.homeLabel ?? 'A definir';
  const awayName = match.awayTeam?.name ?? match.awayLabel ?? 'A definir';
  const roundLabel = match.teamGroup
    ? `Fecha ${match.matchday ?? ''} · Grupo ${match.teamGroup.name}`.trim()
    : STAGE_ES[match.stage.type] ?? match.stage.name;
  const inputCls =
    'h-14 w-14 shrink-0 rounded-xl border-2 border-input bg-background text-center font-display text-2xl font-bold focus:border-primary focus:outline-none disabled:opacity-60';
  const homeInput = (
    <input type="number" min={0} max={20} inputMode="numeric" disabled={locked} value={home}
      onWheel={(e) => e.currentTarget.blur()}
      onChange={(e) => onChange(match.id, 'home', e.target.value)} className={inputCls} />
  );
  const awayInput = (
    <input type="number" min={0} max={20} inputMode="numeric" disabled={locked} value={away}
      onWheel={(e) => e.currentTarget.blur()}
      onChange={(e) => onChange(match.id, 'away', e.target.value)} className={inputCls} />
  );

  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wide text-primary">{roundLabel}</span>
        {finished && <Badge variant="secondary">Real {match.homeScore}-{match.awayScore}</Badge>}
      </div>

      {/* MOBILE: equipos arriba (nombre completo) y casilleros abajo */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Flag code={match.homeTeam?.code} name={homeName} size="md" />
            <span className="truncate text-sm font-semibold">{homeName}</span>
          </div>
          <div className="flex min-w-0 items-center justify-end gap-2 text-right">
            <span className="truncate text-sm font-semibold">{awayName}</span>
            <Flag code={match.awayTeam?.code} name={awayName} size="md" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-3">
          {homeInput}
          <span className="text-muted-foreground">-</span>
          {awayInput}
        </div>
      </div>

      {/* DESKTOP: una sola fila */}
      <div className="hidden items-center gap-2 sm:flex">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
          <span className="truncate text-sm font-semibold">{homeName}</span>
          <Flag code={match.homeTeam?.code} name={homeName} size="md" />
        </div>
        {homeInput}
        <span className="shrink-0 text-muted-foreground">-</span>
        {awayInput}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Flag code={match.awayTeam?.code} name={awayName} size="md" />
          <span className="truncate text-sm font-semibold">{awayName}</span>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {formatMatchDay(match.kickoff)}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-foreground/80"><Clock className="h-3 w-3" /> {formatMatchTime(match.kickoff)}</span>
        {match.venue && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" /> {match.venue}{match.city ? `, ${match.city}` : ''}</span>}
      </div>
    </div>
  );
}

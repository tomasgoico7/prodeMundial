'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Trophy,
  Target,
  CheckCircle2,
  Crown,
  Lock,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchRow, type MatchPrediction } from '@/components/match-row';
import { Flag } from '@/components/flag';
import { FraseCelebre } from '@/components/frases';
import { Bell } from 'lucide-react';
import { useDashboard } from '@/features/dashboard/use-dashboard';
import { useAllMatches } from '@/features/tournament/use-tournament';
import { useMyPrediction } from '@/features/predictions/use-prediction';
import { useAuthStore } from '@/store/auth-store';
import { ordinal, dayKey, formatDayLong } from '@/lib/utils';
import type { Match } from '@/lib/types';

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const { data: prediction } = useMyPrediction();
  const user = useAuthStore((s) => s.user);

  const openPhases = (prediction?.phases ?? []).filter((p) => p.status === 'open');

  return (
    <div className="space-y-8">
      {/* Aviso: fases habilitadas para completar */}
      {openPhases.length > 0 && (
        <Link href="/predictions" className="block">
          <div className="flex items-center gap-3 rounded-xl border border-accent/50 bg-accent/10 px-4 py-3 transition-colors hover:bg-accent/20">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/20 text-accent">
              <Bell className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm uppercase tracking-tight">
                ¡Tenés {openPhases.length === 1 ? 'una fase' : `${openPhases.length} fases`} para completar!
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {openPhases.map((p) => p.label).join(' · ')} — cargá y firmá antes de que arranque.
              </p>
            </div>
            <span className="hidden shrink-0 text-sm font-semibold text-accent sm:block">Completar →</span>
          </div>
        </Link>
      )}
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">
            ¡Aguante, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Tu vestuario para el Mundial 2026. A romperla, crack.
          </p>
        </div>
        <Button asChild>
          <Link href="/predictions">
            <Target className="h-4 w-4" /> Cargar mi planilla
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Trophy}
          label="Puntos"
          value={data?.score.points}
          loading={isLoading}
          accent
        />
        <StatCard
          icon={Target}
          label="Plenos (exactos)"
          value={data?.score.exactHits}
          loading={isLoading}
        />
        <StatCard
          icon={CheckCircle2}
          label="Aciertos"
          value={data?.score.outcomeHits}
          loading={isLoading}
        />
        <StatCard
          icon={CalendarDays}
          label="Partidos cargados"
          value={data?.prediction.matchesPredicted}
          loading={isLoading}
        />
      </div>

      <FraseCelebre />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* La fecha que viene — por día, con navegación */}
        <div className="min-w-0 lg:col-span-2">
          <ProximaFecha />
        </div>

        {/* Prediction status + champion */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Mi Planilla</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    (data?.prediction.phasesLocked ?? 0) >= (data?.prediction.totalPhases ?? 6)
                      ? 'success'
                      : 'outline'
                  }
                  className="gap-1"
                >
                  <Lock className="h-3 w-3" /> {data?.prediction.phasesLocked ?? 0}/
                  {data?.prediction.totalPhases ?? 6} fases firmadas
                </Badge>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                  El campeón que bancás
                </p>
                {data?.prediction.champion ? (
                  <p className="flex items-center gap-2 font-display text-xl uppercase tracking-tight">
                    <Crown className="h-5 w-5 shrink-0 text-accent" />
                    <Flag
                      code={data.prediction.champion.code}
                      name={data.prediction.champion.name}
                      size="md"
                    />
                    {data.prediction.champion.name}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin definir</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My groups */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Mis barras</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/groups">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          {data?.groups.map((g) => (
            <Link key={g.id} href={`/groups/${g.id}`}>
              <Card className="transition-transform hover:-translate-y-1">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-bold uppercase tracking-tight">{g.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {g.memberCount} cracks
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl text-celeste">
                      {g.rank ? ordinal(g.rank) : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">{g.points} pts</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {!isLoading && data?.groups.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border p-8 text-center">
              <p className="mb-3 text-sm text-muted-foreground">
                Todavía no entraste a ninguna barra. Armá la tuya y meté a los pibes. 🙌
              </p>
              <Button asChild>
                <Link href="/groups">Armar o sumarme a una barra</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface DayBucket {
  key: string;
  date: Date;
  matches: Match[];
}

/**
 * Construye una lista CONTINUA de días (en hora argentina) desde el primer al
 * último partido próximo. Los días intermedios sin partidos se incluyen igual
 * (para avisar que ese día no hay nada).
 */
function buildContinuousDays(matches: Match[]): DayBucket[] {
  if (!matches.length) return [];
  const byDay = new Map<string, Match[]>();
  for (const m of matches) {
    const k = dayKey(m.kickoff);
    byDay.set(k, [...(byDay.get(k) ?? []), m]);
  }
  const keys = [...byDay.keys()].sort();
  const out: DayBucket[] = [];
  // mediodía argentino = 15:00 UTC; AR es UTC-3 fijo (sin horario de verano)
  const cur = new Date(`${keys[0]}T15:00:00Z`);
  const end = new Date(`${keys[keys.length - 1]}T15:00:00Z`);
  let guard = 0;
  while (cur.getTime() <= end.getTime() && guard++ < 120) {
    const k = dayKey(cur);
    out.push({ key: k, date: new Date(cur), matches: byDay.get(k) ?? [] });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

/** Índice del primer día cuya fecha es hoy o futura (la "fecha que viene"). */
function defaultDayIndex(days: DayBucket[]): number {
  const today = dayKey(new Date());
  const i = days.findIndex((d) => d.key >= today);
  return i === -1 ? Math.max(0, days.length - 1) : i;
}

/** "La fecha que viene": navegación día por día (incluye días sin partidos). */
function ProximaFecha() {
  const { data: matches, isLoading } = useAllMatches();
  const { data: prediction } = useMyPrediction();
  const days = useMemo(() => buildContinuousDays(matches ?? []), [matches]);

  // Mapa matchId -> pronóstico del usuario (para mostrarlo en cada partido)
  const predByMatch = useMemo(() => {
    const map = new Map<string, MatchPrediction>();
    for (const pm of prediction?.matches ?? []) {
      map.set(pm.matchId, {
        homeScore: pm.homeScore,
        awayScore: pm.awayScore,
        pointsAwarded: pm.pointsAwarded,
        isExact: pm.isExact,
        isOutcome: pm.isOutcome,
      });
    }
    return map;
  }, [prediction]);

  const [idx, setIdx] = useState<number | null>(null);
  const safe = idx ?? defaultDayIndex(days);
  const clamped = Math.min(safe, Math.max(0, days.length - 1));
  const current = days[clamped];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>La fecha que viene</CardTitle>
        <Badge variant="secondary">Mundial 2026</Badge>
      </CardHeader>

      {isLoading ? (
        <CardContent className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      ) : !current ? (
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">
            Por ahora no hay partidos. Ya va a arrancar la pelota. ⚽
          </p>
        </CardContent>
      ) : (
        <>
          {/* Navegador de día */}
          <div className="flex items-center justify-between gap-2 border-y border-border/60 px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              disabled={clamped === 0}
              onClick={() => setIdx(Math.max(0, clamped - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Día anterior</span>
            </Button>
            <div className="min-w-0 text-center">
              <p className="flex items-center justify-center gap-1.5 font-display text-base uppercase tracking-tight md:text-lg">
                <CalendarDays className="h-4 w-4 text-primary" />
                {formatDayLong(current.date)}
              </p>
              <p className="text-xs text-muted-foreground">
                Día {clamped + 1} de {days.length} ·{' '}
                {current.matches.length
                  ? `${current.matches.length} ${current.matches.length === 1 ? 'partido' : 'partidos'}`
                  : 'sin partidos'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={clamped >= days.length - 1}
              onClick={() => setIdx(Math.min(days.length - 1, clamped + 1))}
            >
              <span className="hidden sm:inline">Día siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <CardContent className="space-y-2 pt-4">
            {current.matches.length ? (
              current.matches.map((m) => (
                <MatchRow
                  key={m.id}
                  match={m}
                  showDay={false}
                  prediction={predByMatch.get(m.id)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center gap-1 py-8 text-center">
                <span className="text-3xl">🏖️</span>
                <p className="font-display text-lg uppercase tracking-tight">
                  Día de descanso
                </p>
                <p className="text-sm text-muted-foreground">
                  No hay partidos esta fecha. Pasá al día siguiente. 👉
                </p>
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value?: number;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? 'border-primary/40 bg-primary/5' : undefined}>
      <CardContent className="p-5">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        {loading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="font-display text-3xl font-extrabold tabular-nums">
            {value ?? 0}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

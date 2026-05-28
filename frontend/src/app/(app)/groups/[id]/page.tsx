'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Copy,
  Check,
  Users,
  Trophy,
  Target,
  Crown,
  Percent,
  Loader2,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/user-avatar';
import { useGroup, useInviteToGroup } from '@/features/groups/use-groups';
import { useGroupRanking, useGroupPhaseRankings } from '@/features/rankings/use-rankings';
import { useGroupStats } from '@/features/stats/use-stats';
import { useFinalMatch } from '@/features/tournament/use-tournament';
import { RankingTable } from '@/features/groups/components/ranking-table';
import { ChampionChart } from '@/features/groups/components/champion-chart';
import { Flag } from '@/components/flag';
import { ChampionCelebration } from '@/components/celebration';
import { useAuthStore } from '@/store/auth-store';

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: group, isLoading } = useGroup(id);
  const { data: ranking, isLoading: loadingRanking } = useGroupRanking(id);
  const { data: finalMatches } = useFinalMatch();
  const me = useAuthStore((s) => s.user);

  // ¿Terminó el torneo y soy el campeón (rank 1) de este grupo?
  const tournamentFinished = !!finalMatches?.some((m) => m.status === 'FINISHED');
  const iAmChampion =
    tournamentFinished &&
    !!me &&
    !!ranking?.some((s) => s.userId === me.id && s.rank === 1 && s.points > 0);

  const [showCelebration, setShowCelebration] = useState(false);
  useEffect(() => {
    if (!iAmChampion || !id) return;
    if (typeof window === 'undefined') return;
    if (!window.localStorage.getItem(`champ-celebrated-${id}`)) {
      setShowCelebration(true);
    }
  }, [iAmChampion, id]);
  const closeCelebration = () => {
    setShowCelebration(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`champ-celebrated-${id}`, '1');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!group) return <p>Grupo no encontrado.</p>;

  return (
    <div className="space-y-6">
      {showCelebration && (
        <ChampionCelebration
          name={me?.firstName ?? 'Crack'}
          onClose={closeCelebration}
        />
      )}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">
            {group.name}
          </h1>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" /> {group.members.length} cracks
          </p>
        </div>
        <ShareBlock id={id} inviteCode={group.inviteCode} />
      </div>

      <Tabs defaultValue="ranking">
        <div className="overflow-x-auto pb-1">
          <TabsList>
            <TabsTrigger value="ranking">
              <Trophy className="mr-1.5 h-4 w-4" /> Ranking
            </TabsTrigger>
            <TabsTrigger value="phase">Por fase</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="members">Miembros</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ranking" className="space-y-4">
          {iAmChampion && (
            <button
              onClick={() => setShowCelebration(true)}
              className="banda-afa flex w-full items-center justify-center gap-2 rounded-xl border border-accent/50 p-3 font-display text-lg uppercase tracking-tight text-[#0b2a4a] shadow-md transition-transform hover:-translate-y-0.5"
            >
              <Crown className="h-5 w-5" /> ¡Sos el campeón del grupo! Tocá para festejar 🎉
            </button>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Tabla de posiciones</CardTitle>
            </CardHeader>
            <CardContent>
              <RankingTable standings={ranking} loading={loadingRanking} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phase">
          <PhaseTab groupId={id} />
        </TabsContent>

        <TabsContent value="stats">
          <StatsTab groupId={id} />
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
              {group.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
                >
                  <UserAvatar user={m.user} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {m.user.firstName} {m.user.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.user.email}
                    </p>
                  </div>
                  {m.role === 'OWNER' && (
                    <Badge variant="accent" className="gap-1">
                      <Crown className="h-3 w-3" /> Capitán
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ShareBlock({ id, inviteCode }: { id: string; inviteCode: string }) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const invite = useInviteToGroup(id);

  function copy() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success('Código copiado');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="w-full md:w-auto">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Código</p>
          <code className="font-display text-xl font-extrabold tracking-widest">
            {inviteCode}
          </code>
        </div>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copiar
        </Button>
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="invitar por email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 flex-1 sm:w-44 sm:flex-none"
          />
          <Button
            size="sm"
            disabled={!email.includes('@') || invite.isPending}
            onClick={() => invite.mutate(email, { onSuccess: () => setEmail('') })}
          >
            {invite.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const PHASE_TABS: { key: string; label: string }[] = [
  { key: 'GROUP', label: 'Grupos' },
  { key: 'ROUND_OF_32', label: 'Dieciseisavos' },
  { key: 'ROUND_OF_16', label: 'Octavos' },
  { key: 'QUARTER_FINAL', label: 'Cuartos' },
  { key: 'SEMI_FINAL', label: 'Semis' },
  { key: 'FINAL', label: 'Final y 3°' },
  { key: 'CHAMPION', label: 'Campeón' },
];

function PhaseTab({ groupId }: { groupId: string }) {
  const [active, setActive] = useState('GROUP');
  const { data, isLoading } = useGroupPhaseRankings(groupId);

  const current = data?.find((p) => p.key === active);
  const rows = current?.rows ?? [];
  const noPoints = !isLoading && rows.every((r) => r.points === 0);
  const isChampion = active === 'CHAMPION';

  return (
    <Card>
      <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Rendimiento por fase</CardTitle>
        <div className="flex flex-wrap gap-1">
          {PHASE_TABS.map((p) => (
            <Button
              key={p.key}
              size="sm"
              variant={active === p.key ? 'default' : 'outline'}
              onClick={() => setActive(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        {!isLoading &&
          !noPoints &&
          rows.map((row) => (
            <div
              key={row.user.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3"
            >
              <span className="w-6 font-display font-bold text-muted-foreground">
                {row.rank}
              </span>
              <UserAvatar user={row.user} size={32} />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {row.user.firstName} {row.user.lastName}
              </span>
              {!isChampion && (
                <span className="shrink-0 text-sm text-muted-foreground">
                  {row.exactHits} plenos
                </span>
              )}
              <span className="shrink-0 font-display text-lg text-celeste">
                {row.points} pts
              </span>
            </div>
          ))}
        {noPoints && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {isChampion
              ? 'El campeón se define con la final.'
              : 'Todavía no hay puntos en esta fase.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatsTab({ groupId }: { groupId: string }) {
  const { data, isLoading } = useGroupStats(groupId);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!data) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StatHighlight
        icon={Trophy}
        title={data.topPoints && data.topPoints.users.length > 1 ? 'Líderes en puntos (empate)' : 'Líder en puntos'}
        name={data.topPoints ? data.topPoints.users.map((u) => u.firstName).join(', ') : '—'}
        value={`${data.topPoints?.value ?? 0} pts`}
      />
      <StatHighlight
        icon={Target}
        title={data.topExact && data.topExact.users.length > 1 ? 'Más plenos (empate)' : 'Más plenos (exactos)'}
        name={data.topExact ? data.topExact.users.map((u) => u.firstName).join(', ') : '—'}
        value={`${data.topExact?.value ?? 0} plenos`}
      />
      <StatHighlight
        icon={Crown}
        title={data.mostChosenChampion && data.mostChosenChampion.teams.length > 1 ? 'Campeones más elegidos (empate)' : 'Campeón más elegido'}
        flagCode={data.mostChosenChampion?.teams.length === 1 ? data.mostChosenChampion.teams[0].code : undefined}
        name={data.mostChosenChampion ? data.mostChosenChampion.teams.map((t) => t.name).join(', ') : '—'}
        value={`${data.mostChosenChampion?.votes ?? 0} voto(s) c/u`}
      />
      <StatHighlight
        icon={Users}
        title="Empatados en la punta"
        name={data.tiedAtTop.length > 1 ? `${data.tiedAtTop.length} cracks` : 'Nadie'}
        value={data.tiedAtTop.map((u) => u.firstName).join(', ') || '—'}
      />

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Selecciones más votadas como campeón</CardTitle>
        </CardHeader>
        <CardContent>
          <ChampionChart distribution={data.championDistribution} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" /> Porcentaje de aciertos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.accuracy.map((a) => (
            <div key={a.user.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {a.user.firstName} {a.user.lastName}
                </span>
                <span className="text-muted-foreground">
                  {a.hits}/{a.predicted} · {a.percentage}%
                </span>
              </div>
              <Progress value={a.percentage} />
            </div>
          ))}
          {data.accuracy.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Sin datos de aciertos aún.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatHighlight({
  icon: Icon,
  title,
  name,
  value,
  flagCode,
}: {
  icon: React.ElementType;
  title: string;
  name: string;
  value: string;
  flagCode?: string | null;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="flex items-center gap-2 font-display text-lg uppercase leading-tight tracking-tight">
            {flagCode && <Flag code={flagCode} name={name} size="md" />}
            <span className="line-clamp-2">{name}</span>
          </p>
          <p className="truncate text-sm text-muted-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

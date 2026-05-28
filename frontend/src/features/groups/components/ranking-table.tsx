'use client';

import { Crown, Target } from 'lucide-react';
import { UserAvatar } from '@/components/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { Standing } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

const MEDALS = ['🥇', '🥈', '🥉'];

export function RankingTable({
  standings,
  loading,
}: {
  standings?: Standing[];
  loading: boolean;
}) {
  const currentUserId = useAuthStore((s) => s.user?.id);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!standings?.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Sin posiciones todavía.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {standings.map((s, i) => {
        const isMe = s.userId === currentUserId;
        return (
          <div
            key={s.id}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3 transition-colors',
              isMe
                ? 'border-primary/50 bg-primary/5'
                : 'border-border/60 bg-background/40',
            )}
          >
            <div className="grid w-8 place-items-center font-display text-lg font-extrabold">
              {i < 3 ? MEDALS[i] : <span className="text-muted-foreground">{s.rank}</span>}
            </div>
            <UserAvatar user={s.user} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {s.user.firstName} {s.user.lastName}
                {isMe && <span className="ml-2 text-xs text-primary">(vos)</span>}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" /> {s.exactHits} exactos
                </span>
                <span>{s.outcomeHits} simples</span>
                {s.championHit && (
                  <span className="flex items-center gap-1 text-accent">
                    <Crown className="h-3 w-3" /> campeón
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-extrabold tabular-nums text-gradient">
                {s.points}
              </p>
              <p className="text-[10px] uppercase text-muted-foreground">pts</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

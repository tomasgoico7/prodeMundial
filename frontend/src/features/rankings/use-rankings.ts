'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { MatchdayRow, PhaseRanking, Standing } from '@/lib/types';

export function useGroupRanking(groupId: string) {
  return useQuery({
    queryKey: ['ranking', groupId],
    queryFn: () => api.get<Standing[]>(`/groups/${groupId}/ranking`),
    enabled: !!groupId,
  });
}

export function useMatchdayRanking(groupId: string, matchday: number) {
  return useQuery({
    queryKey: ['ranking', groupId, 'matchday', matchday],
    queryFn: () =>
      api.get<MatchdayRow[]>(`/groups/${groupId}/ranking/matchday/${matchday}`),
    enabled: !!groupId,
  });
}

export function useGroupPhaseRankings(groupId: string) {
  return useQuery({
    queryKey: ['ranking', groupId, 'phases'],
    queryFn: () =>
      api.get<PhaseRanking[]>(`/groups/${groupId}/ranking/phases`),
    enabled: !!groupId,
  });
}

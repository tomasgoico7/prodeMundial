'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { GroupStats } from '@/lib/types';

export function useGroupStats(groupId: string) {
  return useQuery({
    queryKey: ['stats', groupId],
    queryFn: () => api.get<GroupStats>(`/groups/${groupId}/stats`),
    enabled: !!groupId,
  });
}

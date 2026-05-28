'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { GroupDetail, GroupSummary } from '@/lib/types';

export function useMyGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get<GroupSummary[]>('/groups'),
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => api.get<GroupDetail>(`/groups/${id}`),
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      api.post<GroupDetail>('/groups', payload),
    onSuccess: (group) => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Grupo "${group.name}" creado 🏆`);
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) =>
      api.post<GroupDetail>('/groups/join', { inviteCode }),
    onSuccess: (group) => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Te uniste a "${group.name}" 🙌`);
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useInviteToGroup(groupId: string) {
  return useMutation({
    mutationFn: (email: string) =>
      api.post<{ shareCode: string }>(`/groups/${groupId}/invite`, { email }),
    onSuccess: () => toast.success('Invitación enviada ✉️'),
    onError: (err: ApiError) => toast.error(err.message),
  });
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { Prediction } from '@/lib/types';

export interface SubmitPayload {
  championTeamId?: string;
  matches: { matchId: string; homeScore: number; awayScore: number }[];
}

export function useMyPrediction() {
  return useQuery({
    queryKey: ['prediction'],
    queryFn: () => api.get<Prediction>('/predictions/me'),
  });
}

export function useSavePhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ phase, payload }: { phase: string; payload: SubmitPayload }) =>
      api.put<Prediction>(`/predictions/me/phase/${phase}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prediction'] });
      toast.success('Borrador guardado 💾');
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useConfirmPhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ phase, payload }: { phase: string; payload: SubmitPayload }) =>
      api.post<Prediction>(`/predictions/me/phase/${phase}/confirm`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prediction'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('¡Fase firmada! 🔒');
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

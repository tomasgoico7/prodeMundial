'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Match, Tournament } from '@/lib/types';

export function useTournament() {
  return useQuery({
    queryKey: ['tournament'],
    queryFn: () => api.get<Tournament>('/tournament'),
    staleTime: 5 * 60_000,
  });
}

export function useGroupStageMatches() {
  return useQuery({
    queryKey: ['matches', 'GROUP'],
    queryFn: () => api.get<Match[]>('/matches?stage=GROUP'),
    staleTime: 60_000,
  });
}

export function useUpcomingMatches(limit = 10) {
  return useQuery({
    queryKey: ['matches', 'upcoming', limit],
    queryFn: () => api.get<Match[]>(`/matches/upcoming?limit=${limit}`),
    refetchInterval: 60_000,
  });
}

export function useAllMatches() {
  return useQuery({
    queryKey: ['matches', 'all'],
    queryFn: () => api.get<Match[]>('/matches'),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

/** Partido de la final (para saber si el torneo terminó). */
export function useFinalMatch() {
  return useQuery({
    queryKey: ['matches', 'FINAL'],
    queryFn: () => api.get<Match[]>('/matches?stage=FINAL'),
    staleTime: 60_000,
  });
}

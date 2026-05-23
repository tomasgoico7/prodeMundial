'use client';

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ApiError } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

/**
 * Ante un 401 (sesión vencida o token inválido, p.ej. tras un reset de la BD),
 * cerramos sesión y mandamos al login en vez de dejar pantallas vacías.
 */
function handleError(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    useAuthStore.getState().logout();
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      window.location.href = '/login';
    }
  }
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleError }),
        mutationCache: new MutationCache({ onError: handleError }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (count, error) =>
              error instanceof ApiError && error.status === 401
                ? false
                : count < 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types';
import { setToken } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hydrated: false,
      setSession: (token, user) => {
        setToken(token);
        set({ token, user });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        setToken(null);
        set({ token: null, user: null });
      },
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'mundialeros_auth',
      onRehydrateStorage: () => (state) => {
        // keep the api client token in sync with the persisted store
        if (state?.token) setToken(state.token);
        state?.setHydrated();
      },
    },
  ),
);

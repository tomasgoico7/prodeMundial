'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type { AuthResponse, User } from '@/lib/types';

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function useRegister() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      api.post<AuthResponse>('/auth/register', payload),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      toast.success(`¡Bienvenido, ${data.user.firstName}! 🎉`);
      router.push('/dashboard');
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      api.post<AuthResponse>('/auth/login', payload),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      toast.success(`¡Hola de nuevo, ${data.user.firstName}!`);
      router.push('/dashboard');
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useUpdateAvatar() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (avatarUrl: string) =>
      api.patch<User>('/users/me', { avatarUrl }),
    onSuccess: (user) => {
      setUser(user);
      toast.success('Avatar actualizado ⚽');
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const qc = useQueryClient();

  return () => {
    logout();
    qc.clear();
    router.push('/login');
  };
}

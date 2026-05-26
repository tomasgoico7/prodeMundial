'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Logo } from '@/components/logo';

/**
 * Client-side route protection for the authenticated app area.
 * Waits for the persisted store to hydrate before deciding to redirect.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace('/login');
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="animate-pulse">
          <Logo />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

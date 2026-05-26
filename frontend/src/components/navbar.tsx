'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Trophy, Users, LogOut, Smile } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserAvatar, AvatarImg, AVATARS } from '@/components/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/auth-store';
import { useLogout, useUpdateAvatar } from '@/features/auth/use-auth';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Mi Cancha', icon: Home },
  { href: '/predictions', label: 'Mi Planilla', icon: ClipboardList },
  { href: '/groups', label: 'La Barra', icon: Users },
];

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const updateAvatar = useUpdateAvatar();
  const [avatarOpen, setAvatarOpen] = useState(false);

  const currentUrl = user?.avatarUrl ?? '';

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-2 sm:gap-4">
          <Link href="/dashboard">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <UserAvatar user={user} size={40} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.firstName} {user?.lastName}
                  <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setAvatarOpen(true)}>
                  <Smile className="h-4 w-4" /> Cambiar avatar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Selector de avatar */}
      <Dialog open={avatarOpen} onOpenChange={setAvatarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase tracking-tight">
              Elegí tu avatar
            </DialogTitle>
            <DialogDescription>Pintáte la cara de fútbol. ⚽</DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-5 gap-3 overflow-y-auto py-2">
            {AVATARS.map((url, i) => (
              <button
                key={i}
                disabled={updateAvatar.isPending}
                onClick={() => {
                  updateAvatar.mutate(url);
                  setAvatarOpen(false);
                }}
                className={cn(
                  'grid place-items-center rounded-xl border p-1.5 transition-all hover:border-primary/50',
                  currentUrl === url ? 'border-primary bg-primary/10' : 'border-border',
                )}
              >
                <AvatarImg url={url} size={52} />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-3">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export { Trophy };

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '⚽';
}

export function formatKickoff(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "sáb 13 jun" (en horario argentino) */
export function formatMatchDay(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: AR_TZ,
  });
}

/** "16:00 hs" (hora de Argentina) */
export function formatMatchTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return (
    d.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires',
    }) + ' hs'
  );
}

export function ordinal(n: number): string {
  return `${n}°`;
}

const AR_TZ = 'America/Argentina/Buenos_Aires';

/** Clave de día (YYYY-MM-DD) en horario argentino, para agrupar partidos. */
export function dayKey(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // en-CA da formato YYYY-MM-DD
  return d.toLocaleDateString('en-CA', { timeZone: AR_TZ });
}

/** "Sábado 13 de junio" */
export function formatDayLong(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const s = d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: AR_TZ,
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

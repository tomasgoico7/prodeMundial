import { cn } from '@/lib/utils';

/**
 * Ícono de app minimalista: la pelota de fútbol clásica, en celeste y blanco.
 * Pelota blanca con el patrón de gajos (pentágono central + costuras) en celeste.
 * Plano, simple y memorable. Sirve también de favicon.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('h-10 w-10 shrink-0', className)} aria-hidden>
      <circle cx="32" cy="32" r="28" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
      <g stroke="#0284c7" strokeWidth="2" strokeLinecap="round">
        <line x1="32" y1="25" x2="32" y2="18" />
        <line x1="38.7" y1="29.8" x2="45.3" y2="27.7" />
        <line x1="36.1" y1="37.7" x2="40.2" y2="43.3" />
        <line x1="27.9" y1="37.7" x2="23.8" y2="43.3" />
        <line x1="25.3" y1="29.8" x2="18.7" y2="27.7" />
      </g>
      <g fill="#0284c7">
        <polygon points="32,25 38.7,29.8 36.1,37.7 27.9,37.7 25.3,29.8" />
        <polygon points="32,18 26.3,13.9 28.5,7.2 35.5,7.2 37.7,13.9" />
        <polygon points="45.3,27.7 47.5,21 54.6,21 56.7,27.7 51,31.8" />
        <polygon points="40.2,43.3 47.3,43.3 49.5,50 43.8,54.2 38.1,50" />
        <polygon points="23.8,43.3 26,50 20.2,54.2 14.5,50 16.7,43.3" />
        <polygon points="18.7,27.7 13,31.8 7.3,27.7 9.5,21 16.5,21" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  showStars = true,
}: {
  className?: string;
  showStars?: boolean;
}) {
  return (
    <span className={cn('flex items-center gap-2 sm:gap-2.5', className)}>
      <LogoMark className="drop-shadow-md h-9 w-9 sm:h-10 sm:w-10" />
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate font-display text-base uppercase tracking-wide sm:text-lg">
          El Prode de la <span className="text-primary">Gambeta</span>
        </span>
        {showStars && (
          <span className="mt-0.5 hidden items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:flex">
            <span className="text-sol">★★★</span> Prode Mundial 2026
          </span>
        )}
      </span>
    </span>
  );
}

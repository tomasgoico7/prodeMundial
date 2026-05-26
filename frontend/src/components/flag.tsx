import { cn } from '@/lib/utils';

/**
 * Bandera real del país a partir del código FIFA de la selección.
 * Usa imágenes de flagcdn (SVG) en vez de emojis — los emojis de bandera
 * NO se renderizan en Windows, por eso usamos imágenes.
 */

// Código FIFA (3 letras) → código ISO de flagcdn (2 letras o subdivisión).
const CODE_TO_ISO: Record<string, string> = {
  // Selecciones del Mundial 2026 (sorteo oficial)
  MEX: 'mx', RSA: 'za', KOR: 'kr', CZE: 'cz',
  CAN: 'ca', BIH: 'ba', QAT: 'qa', SUI: 'ch',
  BRA: 'br', MAR: 'ma', HAI: 'ht', SCO: 'gb-sct',
  USA: 'us', PAR: 'py', AUS: 'au', TUR: 'tr',
  GER: 'de', CUW: 'cw', CIV: 'ci', ECU: 'ec',
  NED: 'nl', JPN: 'jp', SWE: 'se', TUN: 'tn',
  BEL: 'be', EGY: 'eg', IRN: 'ir', NZL: 'nz',
  ESP: 'es', CPV: 'cv', KSA: 'sa', URU: 'uy',
  FRA: 'fr', SEN: 'sn', IRQ: 'iq', NOR: 'no',
  ARG: 'ar', ALG: 'dz', AUT: 'at', JOR: 'jo',
  POR: 'pt', COD: 'cd', UZB: 'uz', COL: 'co',
  ENG: 'gb-eng', CRO: 'hr', GHA: 'gh', PAN: 'pa',
};

const SIZES = {
  sm: 'h-4 w-6',
  md: 'h-5 w-7',
  lg: 'h-7 w-10',
  xl: 'h-9 w-12',
} as const;

export function Flag({
  code,
  name,
  size = 'md',
  className,
}: {
  code?: string | null;
  name?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const iso = code ? CODE_TO_ISO[code] : undefined;

  if (!iso) {
    // Placeholder para selecciones a definir (fases eliminatorias)
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-[3px] bg-muted text-[9px] font-bold text-muted-foreground ring-1 ring-border',
          SIZES[size],
          className,
        )}
      >
        {code ?? '?'}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${iso}.svg`}
      alt={name ?? code ?? 'bandera'}
      loading="lazy"
      className={cn(
        'inline-block shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-black/10',
        SIZES[size],
        className,
      )}
    />
  );
}

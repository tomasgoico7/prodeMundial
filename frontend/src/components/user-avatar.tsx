import { cn } from '@/lib/utils';

/**
 * Avatares = camisetas de selecciones mundialistas con dorsal.
 * Se generan como SVG (data-URI), así que siempre cargan, sin depender de
 * ningún servicio externo ni usar la imagen de ningún jugador real.
 */
type Pattern = 'solid' | 'stripes' | 'sash';
interface Jersey {
  name: string;
  primary: string;
  secondary: string;
  number: number;
  num: string; // color del dorsal
  pattern: Pattern;
}

const J = (
  name: string,
  primary: string,
  secondary: string,
  number: number,
  num = '#ffffff',
  pattern: Pattern = 'solid',
): Jersey => ({ name, primary, secondary, number, num, pattern });

// 50 selecciones (colores aproximados + un dorsal emblemático).
const JERSEYS: Jersey[] = [
  J('Argentina', '#75AADB', '#ffffff', 10, '#0b2a4a', 'stripes'),
  J('Brasil', '#FFDF00', '#1B9E4B', 9, '#0b3b8c'),
  J('Francia', '#1E3A8A', '#ffffff', 7),
  J('Alemania', '#f2f2f2', '#111111', 13, '#111111'),
  J('España', '#C60B1E', '#FFC400', 6),
  J('Inglaterra', '#f5f5f5', '#0b2a4a', 19, '#0b2a4a'),
  J('Países Bajos', '#F36C21', '#ffffff', 14),
  J('Portugal', '#7A0E1E', '#1B9E4B', 17),
  J('Italia', '#1B5FA8', '#ffffff', 8),
  J('Uruguay', '#4A90D9', '#111111', 21, '#0b2a4a'),
  J('Croacia', '#E1142C', '#ffffff', 4, '#ffffff', 'stripes'),
  J('Bélgica', '#C8102E', '#FFD100', 22),
  J('México', '#006847', '#ffffff', 11),
  J('Colombia', '#FCD116', '#003893', 16, '#003893'),
  J('Japón', '#0A3AA0', '#ffffff', 18),
  J('Corea del Sur', '#C8102E', '#1E3A8A', 23),
  J('Estados Unidos', '#f5f5f5', '#0b2a4a', 27, '#B22234', 'stripes'),
  J('Canadá', '#D80621', '#ffffff', 20),
  J('Marruecos', '#C1272D', '#006233', 5),
  J('Senegal', '#00853F', '#FDEF42', 26),
  J('Ghana', '#f2f2f2', '#CE1126', 3, '#006B3F'),
  J('Nigeria', '#008751', '#ffffff', 24),
  J('Camerún', '#007A33', '#CE1126', 12),
  J('Costa de Marfil', '#FF8200', '#009E60', 25),
  J('Ecuador', '#FFD100', '#0033A0', 29, '#0033A0'),
  J('Chile', '#DA291C', '#0033A0', 15),
  J('Perú', '#f5f5f5', '#D91023', 31, '#D91023', 'sash'),
  J('Paraguay', '#D52B1E', '#ffffff', 33, '#ffffff', 'stripes'),
  J('Suiza', '#D52B1E', '#ffffff', 32),
  J('Suecia', '#FECC02', '#006AA7', 30, '#006AA7'),
  J('Dinamarca', '#C8102E', '#ffffff', 34),
  J('Noruega', '#BA0C2F', '#00205B', 35),
  J('Polonia', '#f5f5f5', '#DC143C', 36, '#DC143C'),
  J('Serbia', '#C6363C', '#1E3A8A', 37),
  J('Austria', '#ED2939', '#ffffff', 38),
  J('Gales', '#C8102E', '#1B9E4B', 39),
  J('Escocia', '#0C2340', '#ffffff', 40),
  J('Australia', '#FFCD00', '#00843D', 41, '#00843D'),
  J('Arabia Saudita', '#006C35', '#ffffff', 42),
  J('Irán', '#f2f2f2', '#239F40', 43, '#239F40'),
  J('Qatar', '#8A1538', '#ffffff', 44),
  J('Túnez', '#E70013', '#ffffff', 45),
  J('Argelia', '#f5f5f5', '#006233', 46, '#006233'),
  J('Egipto', '#CE1126', '#111111', 47),
  J('Turquía', '#E30A17', '#ffffff', 48),
  J('Grecia', '#0D5EAF', '#ffffff', 49, '#ffffff', 'stripes'),
  J('Ucrania', '#FFD700', '#0057B7', 50, '#0057B7'),
  J('Sudáfrica', '#007A4D', '#FFB81C', 28, '#FFB81C'),
  J('Nueva Zelanda', '#f5f5f5', '#111111', 1, '#111111'),
  J('Costa Rica', '#C8102E', '#002B7F', 2),
];

const JERSEY_PATH =
  'M10 22 L22 14 L27 14 L32 18 L37 14 L42 14 L54 22 L50 30 L44 26 L44 54 L20 54 L20 26 L14 30 Z';

function jerseySvg(j: Jersey): string {
  let overlay = '';
  if (j.pattern === 'stripes') {
    const s = [22.5, 30.5, 38.5]
      .map(
        (x) => `<rect x="${x}" y="10" width="3.6" height="46" fill="${j.secondary}"/>`,
      )
      .join('');
    overlay = `<g clip-path="url(#clip)">${s}</g>`;
  } else if (j.pattern === 'sash') {
    overlay = `<g clip-path="url(#clip)"><polygon points="42,11 52,17 20,55 11,49" fill="${j.secondary}"/></g>`;
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<defs><clipPath id="clip"><path d="${JERSEY_PATH}"/></clipPath></defs>` +
    `<circle cx="32" cy="32" r="32" fill="#0e1b2e"/>` +
    `<path d="${JERSEY_PATH}" fill="${j.primary}" stroke="rgba(255,255,255,.18)" stroke-width="1"/>` +
    overlay +
    `<path d="M27 14 L32 18 L37 14" fill="none" stroke="${j.secondary}" stroke-width="2"/>` +
    `<text x="32" y="43" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="bold" fill="${j.num}">${j.number}</text>` +
    `</svg>`
  );
}

const toDataUri = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** Las 50 camisetas para elegir. */
export const AVATARS = JERSEYS.map((j) => toDataUri(jerseySvg(j)));

function isImageUrl(url?: string | null): url is string {
  return !!url && (url.startsWith('http') || url.startsWith('data:'));
}

export function AvatarImg({
  url,
  size = 36,
  className,
}: {
  url: string;
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className={cn(
        'shrink-0 rounded-full bg-secondary object-cover ring-1 ring-black/10',
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}

/** Avatar genérico por defecto: silueta de usuario (sin elección todavía). */
export function GenericAvatar({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground ring-1 ring-black/10',
        className,
      )}
      style={{ width: size, height: size }}
      aria-label="Avatar por defecto"
    >
      <svg
        viewBox="0 0 24 24"
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        fill="currentColor"
        aria-hidden
      >
        <circle cx="12" cy="8.2" r="4" />
        <path d="M3.6 20.5c0-4.3 3.9-6.5 8.4-6.5s8.4 2.2 8.4 6.5z" />
      </svg>
    </span>
  );
}

interface AvatarUser {
  avatarUrl?: string | null;
}

/** Avatar del usuario: su avatar elegido, o el genérico por defecto. */
export function UserAvatar({
  user,
  size = 36,
  className,
}: {
  user?: AvatarUser | null;
  size?: number;
  className?: string;
}) {
  const url = user?.avatarUrl;
  if (isImageUrl(url)) {
    return <AvatarImg url={url} size={size} className={className} />;
  }
  return <GenericAvatar size={size} className={className} />;
}

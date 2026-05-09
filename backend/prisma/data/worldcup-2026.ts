/**
 * Canonical World Cup 2026 dataset (48 teams, 12 groups).
 *
 * This is the single source of truth for the built-in "static" football
 * provider and the database seed. Swapping to a live provider (api-football)
 * means implementing the same shape from the remote API — nothing else changes.
 *
 * Team selection is a plausible 48-team field; group draw is illustrative.
 */

export interface SeedTeam {
  name: string;
  code: string; // 3-letter
  flag: string; // emoji
}

export interface SeedGroup {
  name: string; // "A" .. "L"
  teams: SeedTeam[];
}

export const TOURNAMENT = {
  name: 'FIFA World Cup',
  season: 2026,
  externalId: 'wc-2026',
  startDate: '2026-06-11T16:00:00.000Z',
  endDate: '2026-07-19T19:00:00.000Z',
};

// flag emoji helper used by code consumers if needed
export function flagFromCountry(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

// Grupos OFICIALES del sorteo del Mundial 2026 (5 dic 2025, Washington D.C.).
// Nombres en español (rioplatense). El `flag` es solo un fallback de emoji;
// el frontend renderiza imágenes reales de bandera a partir del `code`.
export const GROUPS: SeedGroup[] = [
  {
    name: 'A',
    teams: [
      { name: 'México', code: 'MEX', flag: '🇲🇽' },
      { name: 'Sudáfrica', code: 'RSA', flag: '🇿🇦' },
      { name: 'Corea del Sur', code: 'KOR', flag: '🇰🇷' },
      { name: 'Chequia', code: 'CZE', flag: '🇨🇿' },
    ],
  },
  {
    name: 'B',
    teams: [
      { name: 'Canadá', code: 'CAN', flag: '🇨🇦' },
      { name: 'Bosnia y Herzegovina', code: 'BIH', flag: '🇧🇦' },
      { name: 'Catar', code: 'QAT', flag: '🇶🇦' },
      { name: 'Suiza', code: 'SUI', flag: '🇨🇭' },
    ],
  },
  {
    name: 'C',
    teams: [
      { name: 'Brasil', code: 'BRA', flag: '🇧🇷' },
      { name: 'Marruecos', code: 'MAR', flag: '🇲🇦' },
      { name: 'Haití', code: 'HAI', flag: '🇭🇹' },
      { name: 'Escocia', code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    ],
  },
  {
    name: 'D',
    teams: [
      { name: 'Estados Unidos', code: 'USA', flag: '🇺🇸' },
      { name: 'Paraguay', code: 'PAR', flag: '🇵🇾' },
      { name: 'Australia', code: 'AUS', flag: '🇦🇺' },
      { name: 'Turquía', code: 'TUR', flag: '🇹🇷' },
    ],
  },
  {
    name: 'E',
    teams: [
      { name: 'Alemania', code: 'GER', flag: '🇩🇪' },
      { name: 'Curazao', code: 'CUW', flag: '🇨🇼' },
      { name: 'Costa de Marfil', code: 'CIV', flag: '🇨🇮' },
      { name: 'Ecuador', code: 'ECU', flag: '🇪🇨' },
    ],
  },
  {
    name: 'F',
    teams: [
      { name: 'Países Bajos', code: 'NED', flag: '🇳🇱' },
      { name: 'Japón', code: 'JPN', flag: '🇯🇵' },
      { name: 'Suecia', code: 'SWE', flag: '🇸🇪' },
      { name: 'Túnez', code: 'TUN', flag: '🇹🇳' },
    ],
  },
  {
    name: 'G',
    teams: [
      { name: 'Bélgica', code: 'BEL', flag: '🇧🇪' },
      { name: 'Egipto', code: 'EGY', flag: '🇪🇬' },
      { name: 'Irán', code: 'IRN', flag: '🇮🇷' },
      { name: 'Nueva Zelanda', code: 'NZL', flag: '🇳🇿' },
    ],
  },
  {
    name: 'H',
    teams: [
      { name: 'España', code: 'ESP', flag: '🇪🇸' },
      { name: 'Cabo Verde', code: 'CPV', flag: '🇨🇻' },
      { name: 'Arabia Saudita', code: 'KSA', flag: '🇸🇦' },
      { name: 'Uruguay', code: 'URU', flag: '🇺🇾' },
    ],
  },
  {
    name: 'I',
    teams: [
      { name: 'Francia', code: 'FRA', flag: '🇫🇷' },
      { name: 'Senegal', code: 'SEN', flag: '🇸🇳' },
      { name: 'Irak', code: 'IRQ', flag: '🇮🇶' },
      { name: 'Noruega', code: 'NOR', flag: '🇳🇴' },
    ],
  },
  {
    name: 'J',
    teams: [
      { name: 'Argentina', code: 'ARG', flag: '🇦🇷' },
      { name: 'Argelia', code: 'ALG', flag: '🇩🇿' },
      { name: 'Austria', code: 'AUT', flag: '🇦🇹' },
      { name: 'Jordania', code: 'JOR', flag: '🇯🇴' },
    ],
  },
  {
    name: 'K',
    teams: [
      { name: 'Portugal', code: 'POR', flag: '🇵🇹' },
      { name: 'RD Congo', code: 'COD', flag: '🇨🇩' },
      { name: 'Uzbekistán', code: 'UZB', flag: '🇺🇿' },
      { name: 'Colombia', code: 'COL', flag: '🇨🇴' },
    ],
  },
  {
    name: 'L',
    teams: [
      { name: 'Inglaterra', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { name: 'Croacia', code: 'CRO', flag: '🇭🇷' },
      { name: 'Ghana', code: 'GHA', flag: '🇬🇭' },
      { name: 'Panamá', code: 'PAN', flag: '🇵🇦' },
    ],
  },
];

// Sedes reales del Mundial 2026 (16 ciudades en USA, Canadá y México).
export interface SeedVenue {
  stadium: string;
  city: string;
}

export const VENUES: SeedVenue[] = [
  { stadium: 'MetLife Stadium', city: 'Nueva York / Nueva Jersey' },
  { stadium: 'SoFi Stadium', city: 'Los Ángeles' },
  { stadium: 'AT&T Stadium', city: 'Dallas' },
  { stadium: 'Mercedes-Benz Stadium', city: 'Atlanta' },
  { stadium: 'NRG Stadium', city: 'Houston' },
  { stadium: 'Lincoln Financial Field', city: 'Filadelfia' },
  { stadium: 'Lumen Field', city: 'Seattle' },
  { stadium: "Levi's Stadium", city: 'San Francisco / Bahía' },
  { stadium: 'Arrowhead Stadium', city: 'Kansas City' },
  { stadium: 'Hard Rock Stadium', city: 'Miami' },
  { stadium: 'Gillette Stadium', city: 'Boston / Foxborough' },
  { stadium: 'BMO Field', city: 'Toronto' },
  { stadium: 'BC Place', city: 'Vancouver' },
  { stadium: 'Estadio Azteca', city: 'Ciudad de México' },
  { stadium: 'Estadio Akron', city: 'Guadalajara' },
  { stadium: 'Estadio BBVA', city: 'Monterrey' },
];

// Round-robin schedule template for a 4-team group → 3 matchdays, 2 matches each.
// indexes refer to team positions 0..3 within a group.
export const GROUP_ROUND_ROBIN: Array<{
  matchday: number;
  pairs: [number, number][];
}> = [
  { matchday: 1, pairs: [[0, 1], [2, 3]] },
  { matchday: 2, pairs: [[0, 2], [3, 1]] },
  { matchday: 3, pairs: [[3, 0], [1, 2]] },
];

export interface SeedStage {
  type:
    | 'GROUP'
    | 'ROUND_OF_32'
    | 'ROUND_OF_16'
    | 'QUARTER_FINAL'
    | 'SEMI_FINAL'
    | 'THIRD_PLACE'
    | 'FINAL';
  name: string;
  order: number;
}

export const STAGES: SeedStage[] = [
  { type: 'GROUP', name: 'Fase de grupos', order: 1 },
  { type: 'ROUND_OF_32', name: 'Dieciseisavos de final', order: 2 },
  { type: 'ROUND_OF_16', name: 'Octavos de final', order: 3 },
  { type: 'QUARTER_FINAL', name: 'Cuartos de final', order: 4 },
  { type: 'SEMI_FINAL', name: 'Semifinales', order: 5 },
  { type: 'THIRD_PLACE', name: 'Tercer puesto', order: 6 },
  { type: 'FINAL', name: 'Final', order: 7 },
];

// Knockout bracket as placeholder matches (teams TBD until groups resolve).
export interface SeedKnockoutMatch {
  stage: SeedStage['type'];
  homeLabel: string;
  awayLabel: string;
  daysFromStart: number;
}

function buildKnockout(): SeedKnockoutMatch[] {
  const out: SeedKnockoutMatch[] = [];
  for (let i = 1; i <= 16; i++) {
    out.push({
      stage: 'ROUND_OF_32',
      homeLabel: `R32 Slot ${i * 2 - 1}`,
      awayLabel: `R32 Slot ${i * 2}`,
      daysFromStart: 18 + Math.floor((i - 1) / 4),
    });
  }
  for (let i = 1; i <= 8; i++) {
    out.push({
      stage: 'ROUND_OF_16',
      homeLabel: `Winner R32-${i * 2 - 1}`,
      awayLabel: `Winner R32-${i * 2}`,
      daysFromStart: 24 + Math.floor((i - 1) / 2),
    });
  }
  for (let i = 1; i <= 4; i++) {
    out.push({
      stage: 'QUARTER_FINAL',
      homeLabel: `Winner R16-${i * 2 - 1}`,
      awayLabel: `Winner R16-${i * 2}`,
      daysFromStart: 29 + Math.floor((i - 1) / 2),
    });
  }
  for (let i = 1; i <= 2; i++) {
    out.push({
      stage: 'SEMI_FINAL',
      homeLabel: `Winner QF-${i * 2 - 1}`,
      awayLabel: `Winner QF-${i * 2}`,
      daysFromStart: 33 + (i - 1),
    });
  }
  out.push({
    stage: 'THIRD_PLACE',
    homeLabel: 'Loser SF-1',
    awayLabel: 'Loser SF-2',
    daysFromStart: 37,
  });
  out.push({
    stage: 'FINAL',
    homeLabel: 'Winner SF-1',
    awayLabel: 'Winner SF-2',
    daysFromStart: 38,
  });
  return out;
}

export const KNOCKOUT_MATCHES = buildKnockout();

// ─────────────────────────────────────────────────────────────
// Fuente OFICIAL y GRATUITA del fixture 2026 (openfootball, dominio público,
// sin API key). El seed la importa por defecto y cae al dataset interno si
// no hay conexión.
// ─────────────────────────────────────────────────────────────
export const OPENFOOTBALL_2026_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

export interface OpenFootballMatch {
  round: string; // "Matchday 1", "Round of 32", "Final", ...
  date: string; // "2026-06-11"
  time?: string; // "13:00 UTC-6"
  team1: string;
  team2: string;
  group?: string; // "Group A"
  ground?: string; // host city, e.g. "Mexico City"
  score1?: number;
  score2?: number;
}

export interface OpenFootballFile {
  name: string;
  matches: OpenFootballMatch[];
}

// Nombre en inglés (tal cual lo trae openfootball) → datos en español.
export const EN_TO_TEAM: Record<string, SeedTeam> = {
  Algeria: { name: 'Argelia', code: 'ALG', flag: '🇩🇿' },
  Argentina: { name: 'Argentina', code: 'ARG', flag: '🇦🇷' },
  Australia: { name: 'Australia', code: 'AUS', flag: '🇦🇺' },
  Austria: { name: 'Austria', code: 'AUT', flag: '🇦🇹' },
  Belgium: { name: 'Bélgica', code: 'BEL', flag: '🇧🇪' },
  'Bosnia & Herzegovina': { name: 'Bosnia y Herzegovina', code: 'BIH', flag: '🇧🇦' },
  Brazil: { name: 'Brasil', code: 'BRA', flag: '🇧🇷' },
  Canada: { name: 'Canadá', code: 'CAN', flag: '🇨🇦' },
  'Cape Verde': { name: 'Cabo Verde', code: 'CPV', flag: '🇨🇻' },
  Colombia: { name: 'Colombia', code: 'COL', flag: '🇨🇴' },
  Croatia: { name: 'Croacia', code: 'CRO', flag: '🇭🇷' },
  'Curaçao': { name: 'Curazao', code: 'CUW', flag: '🇨🇼' },
  'Czech Republic': { name: 'Chequia', code: 'CZE', flag: '🇨🇿' },
  'DR Congo': { name: 'RD Congo', code: 'COD', flag: '🇨🇩' },
  Ecuador: { name: 'Ecuador', code: 'ECU', flag: '🇪🇨' },
  Egypt: { name: 'Egipto', code: 'EGY', flag: '🇪🇬' },
  England: { name: 'Inglaterra', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  France: { name: 'Francia', code: 'FRA', flag: '🇫🇷' },
  Germany: { name: 'Alemania', code: 'GER', flag: '🇩🇪' },
  Ghana: { name: 'Ghana', code: 'GHA', flag: '🇬🇭' },
  Haiti: { name: 'Haití', code: 'HAI', flag: '🇭🇹' },
  Iran: { name: 'Irán', code: 'IRN', flag: '🇮🇷' },
  Iraq: { name: 'Irak', code: 'IRQ', flag: '🇮🇶' },
  'Ivory Coast': { name: 'Costa de Marfil', code: 'CIV', flag: '🇨🇮' },
  Japan: { name: 'Japón', code: 'JPN', flag: '🇯🇵' },
  Jordan: { name: 'Jordania', code: 'JOR', flag: '🇯🇴' },
  Mexico: { name: 'México', code: 'MEX', flag: '🇲🇽' },
  Morocco: { name: 'Marruecos', code: 'MAR', flag: '🇲🇦' },
  Netherlands: { name: 'Países Bajos', code: 'NED', flag: '🇳🇱' },
  'New Zealand': { name: 'Nueva Zelanda', code: 'NZL', flag: '🇳🇿' },
  Norway: { name: 'Noruega', code: 'NOR', flag: '🇳🇴' },
  Panama: { name: 'Panamá', code: 'PAN', flag: '🇵🇦' },
  Paraguay: { name: 'Paraguay', code: 'PAR', flag: '🇵🇾' },
  Portugal: { name: 'Portugal', code: 'POR', flag: '🇵🇹' },
  Qatar: { name: 'Catar', code: 'QAT', flag: '🇶🇦' },
  'Saudi Arabia': { name: 'Arabia Saudita', code: 'KSA', flag: '🇸🇦' },
  Scotland: { name: 'Escocia', code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  Senegal: { name: 'Senegal', code: 'SEN', flag: '🇸🇳' },
  'South Africa': { name: 'Sudáfrica', code: 'RSA', flag: '🇿🇦' },
  'South Korea': { name: 'Corea del Sur', code: 'KOR', flag: '🇰🇷' },
  Spain: { name: 'España', code: 'ESP', flag: '🇪🇸' },
  Sweden: { name: 'Suecia', code: 'SWE', flag: '🇸🇪' },
  Switzerland: { name: 'Suiza', code: 'SUI', flag: '🇨🇭' },
  Tunisia: { name: 'Túnez', code: 'TUN', flag: '🇹🇳' },
  Turkey: { name: 'Turquía', code: 'TUR', flag: '🇹🇷' },
  USA: { name: 'Estados Unidos', code: 'USA', flag: '🇺🇸' },
  Uruguay: { name: 'Uruguay', code: 'URU', flag: '🇺🇾' },
  Uzbekistan: { name: 'Uzbekistán', code: 'UZB', flag: '🇺🇿' },
};

// Ciudad sede (openfootball) → estadio + ciudad en español.
export const GROUND_TO_VENUE: Record<string, SeedVenue> = {
  'Mexico City': { stadium: 'Estadio Azteca', city: 'Ciudad de México' },
  'Guadalajara (Zapopan)': { stadium: 'Estadio Akron', city: 'Guadalajara' },
  'Monterrey (Guadalupe)': { stadium: 'Estadio BBVA', city: 'Monterrey' },
  Toronto: { stadium: 'BMO Field', city: 'Toronto' },
  Vancouver: { stadium: 'BC Place', city: 'Vancouver' },
  Atlanta: { stadium: 'Mercedes-Benz Stadium', city: 'Atlanta' },
  'Boston (Foxborough)': { stadium: 'Gillette Stadium', city: 'Boston' },
  'Dallas (Arlington)': { stadium: 'AT&T Stadium', city: 'Dallas' },
  Houston: { stadium: 'NRG Stadium', city: 'Houston' },
  'Kansas City': { stadium: 'Arrowhead Stadium', city: 'Kansas City' },
  'Los Angeles (Inglewood)': { stadium: 'SoFi Stadium', city: 'Los Ángeles' },
  'Miami (Miami Gardens)': { stadium: 'Hard Rock Stadium', city: 'Miami' },
  'New York/New Jersey (East Rutherford)': {
    stadium: 'MetLife Stadium',
    city: 'Nueva York / Nueva Jersey',
  },
  Philadelphia: { stadium: 'Lincoln Financial Field', city: 'Filadelfia' },
  'San Francisco Bay Area (Santa Clara)': {
    stadium: "Levi's Stadium",
    city: 'San Francisco',
  },
  Seattle: { stadium: 'Lumen Field', city: 'Seattle' },
};

// "Round" de openfootball → tipo de fase.
export function roundToStage(round: string):
  | 'GROUP'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'THIRD_PLACE'
  | 'FINAL' {
  const r = round.toLowerCase();
  if (r.startsWith('matchday')) return 'GROUP';
  if (r.includes('round of 32')) return 'ROUND_OF_32';
  if (r.includes('round of 16')) return 'ROUND_OF_16';
  if (r.includes('quarter')) return 'QUARTER_FINAL';
  if (r.includes('semi')) return 'SEMI_FINAL';
  if (r.includes('third')) return 'THIRD_PLACE';
  if (r.includes('final')) return 'FINAL';
  return 'GROUP';
}

// Combina fecha + "13:00 UTC-6" en un instante UTC (Date).
export function parseKickoff(date: string, time?: string): Date {
  if (!time) return new Date(`${date}T18:00:00Z`);
  const m = time.match(/(\d{1,2}):(\d{2})\s*UTC([+-]\d{1,2})?/i);
  if (!m) return new Date(`${date}T18:00:00Z`);
  const [, hh, mm, off] = m;
  const offset = off ? Number(off) : 0;
  const sign = offset >= 0 ? '+' : '-';
  const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
  const iso = `${date}T${pad(Number(hh))}:${mm}:00${sign}${pad(offset)}:00`;
  return new Date(iso);
}

// Traduce un placeholder de eliminatoria ("1A", "2B", "3A/B/C/D/F", "W73",
// "L101") a una etiqueta legible en español.
export function knockoutLabel(raw: string): string {
  if (/^[12][A-L]$/.test(raw)) {
    const pos = raw[0] === '1' ? '1°' : '2°';
    return `${pos} Grupo ${raw[1]}`;
  }
  if (/^3[A-L/]+$/.test(raw)) {
    return `3° (${raw.slice(1)})`;
  }
  if (/^W\d+$/i.test(raw)) return `Ganador partido ${raw.slice(1)}`;
  if (/^L\d+$/i.test(raw)) return `Perdedor partido ${raw.slice(1)}`;
  return raw;
}

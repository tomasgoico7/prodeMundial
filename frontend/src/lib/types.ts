export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  flag: string | null;
  teamGroupId: string | null;
}

export interface TeamGroup {
  id: string;
  name: string;
  teams: Team[];
}

export interface Stage {
  id: string;
  type: string;
  name: string;
  order: number;
}

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export interface Match {
  id: string;
  kickoff: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  matchday: number | null;
  matchNumber: number | null;
  homeSlot: string | null;
  awaySlot: string | null;
  venue: string | null;
  city: string | null;
  homeLabel: string | null;
  awayLabel: string | null;
  homeTeam: Team | null;
  awayTeam: Team | null;
  stage: Stage;
  teamGroup: TeamGroup | null;
}

export interface Tournament {
  tournament: {
    id: string;
    name: string;
    season: number;
    groups: TeamGroup[];
  } | null;
  stages: Stage[];
}

export interface PredictionMatch {
  id: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  pointsAwarded: number;
  isExact: boolean;
  isOutcome: boolean;
  match: Match;
}

export type PhaseStatus = 'pending' | 'open' | 'closed' | 'signed';

export interface PredictionPhase {
  key: 'GROUP' | 'ROUND_OF_32' | 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'FINAL';
  label: string;
  stages: string[];
  status: PhaseStatus;
  editable: boolean;
  startsAt: string | null;
}

export interface Prediction {
  id: string;
  userId: string;
  championTeamId: string | null;
  championTeam: Team | null;
  locked: boolean;
  lockedAt: string | null;
  lockedPhases: string[];
  matches: PredictionMatch[];
  phases: PredictionPhase[];
}

export interface GroupSummary {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  owner: User;
  _count: { members: number };
}

export interface GroupMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'MEMBER';
  user: User;
}

export interface GroupDetail extends GroupSummary {
  members: GroupMember[];
}

export interface Standing {
  id: string;
  userId: string;
  points: number;
  exactHits: number;
  outcomeHits: number;
  championHit: boolean;
  rank: number;
  user: User;
}

export interface MatchdayRow {
  user: User;
  points: number;
  exactHits: number;
  rank: number;
}

export interface PhaseRanking {
  key: string;
  label: string;
  rows: MatchdayRow[];
}

export interface GroupStats {
  memberCount: number;
  topPoints: { users: User[]; value: number } | null;
  topExact: { users: User[]; value: number } | null;
  tiedAtTop: User[];
  accuracy: { user: User; predicted: number; hits: number; percentage: number }[];
  mostChosenChampion: {
    teams: { id: string; name: string; code: string; flag: string | null }[];
    votes: number;
  } | null;
  championDistribution: {
    team: { id: string; name: string; code: string; flag: string | null };
    votes: number;
  }[];
  totalPredictionsLocked: number;
}

export interface DashboardData {
  upcoming: Match[];
  prediction: {
    locked: boolean;
    phasesLocked: number;
    totalPhases: number;
    champion: Team | null;
    matchesPredicted: number;
  };
  score: { points: number; exactHits: number; outcomeHits: number };
  groups: {
    id: string;
    name: string;
    inviteCode: string;
    memberCount: number;
    rank: number;
    points: number;
  }[];
}

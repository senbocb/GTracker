export interface Game {
  id: string;
  user_id: string;
  title: string;
  image?: string;
  banner_url?: string;
  modes: GameMode[];
}

export interface GameMode {
  id: string;
  game_id: string;
  name: string;
  rank: string;
  tier?: string;
  peak_rank?: string;
  history?: GameHistory[];
}

export interface GameHistory {
  id: string;
  mode_id: string;
  rank: string;
  tier?: string;
  map?: string;
  agent?: string;
  result?: 'win' | 'loss' | 'draw';
  timestamp: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  banner_url?: string;
  level: number;
  main_game?: string;
  region?: string;
  bio?: string;
}
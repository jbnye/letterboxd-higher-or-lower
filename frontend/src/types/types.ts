export type GameStatus = "Welcome" | "Playing" | "Lost" | "Leaderboard" | "About" | "Error";
export type Difficulty = "easy" | "medium" | "hard" | "impossible";
export type AuthStatus = "checking" | "authenticated" | "not-authenticated";
export type ServerStatus = 'checking' | 'online' | 'offline';
export type RatingStatus = "secret" | "animating" | "revealed";
export type ColorState = "none" | "correct" | "incorrect";
export type windowBreakpoints = "mobile" | "tablet" | "desktop";
export type Highscores = {
  easy: number;
  medium: number;
  hard: number;
  impossible: number;
};


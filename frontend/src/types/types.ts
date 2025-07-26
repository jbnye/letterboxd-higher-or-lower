export type GameStatus = "Welcome" | "Playing" | "Lost";
export type Difficulty = "easy" | "medium" | "hard" | "impossible";
export type AuthStatus = "checking" | "authenticated" | "not-authenticated";
export type ServerStatus = 'checking' | 'online' | 'offline';
export type RatingStatus = "secret" | "animating" | "revealed";
export type ColorState = "none" | "correct" | "incorrect";
export type Highscores = {
  easy: number;
  medium: number;
  hard: number;
  impossible: number;
};

export interface Highscores {
    easy: number,
    medium: number,
    hard: number,
    impossible: number,
}
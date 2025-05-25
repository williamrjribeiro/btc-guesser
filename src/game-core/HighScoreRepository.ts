import type { HighScore } from './HighScoreAPI';

export type ListHighScore = () => Promise<HighScore[]>;
export type SaveHighScore = (highScore: HighScore) => Promise<{ id: string; date: Date }>;

export interface HighScoreRepository {
  listHighScores: ListHighScore;
  saveHighScore: SaveHighScore;
}

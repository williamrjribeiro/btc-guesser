import { v4 as uuidv4 } from 'uuid';
import type { GetHighScore, SaveHighScore } from '../game-core/HighScoreAPI';
import { HighScore } from '../game-core/HighScoreAPI';
import type { CryptoPriceGuess } from '../game-core/GameCore';

export const getHighScore: GetHighScore = async () => {
  await delay(500);
  return [...highScores].sort((a, b) => b.score - a.score);
};

export const saveHighScore: SaveHighScore = async (priceGuessHistory: CryptoPriceGuess[], username: string) => {
  await delay(300);

  const id = uuidv4();
  const highScore = new HighScore(priceGuessHistory, username);
  highScore.id = id;

  highScores.push(highScore);

  return { id, date: highScore.date };
};

const highScores: HighScore[] = [
  new HighScore('C2,W1,N0', 'crypto_whale', new Date(Date.now() - 300000), uuidv4()),
  new HighScore('C2,W1,N0', 'btc_hodler', new Date(Date.now() - 200000), uuidv4()),
  new HighScore('C2,W1,N0', 'satoshi_fan', new Date(Date.now() - 100000), uuidv4()),
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

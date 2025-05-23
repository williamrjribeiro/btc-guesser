import type { CryptoPriceGuess } from '../game-core/GameCore';
import { HighScore, type GetHighScore, type SaveHighScore } from '../game-core/HighScoreAPI';

const apiUrl = `${import.meta.env.VITE_API_URL}/api/highscore`;

export const saveHighScore: SaveHighScore = async (priceGuessHistory: CryptoPriceGuess[], username: string) => {
  const newHighScore = new HighScore(priceGuessHistory, username);
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(newHighScore),
  });

  const json = await response.json();
  console.log('[saveHighScore] response:', json);

  return { id: json.id, date: new Date(json.date) };
};

export const getHighScore: GetHighScore = async () => {
  const response = await fetch(apiUrl);
  const json = await response.json();
  console.log('[getHighScore]response:', json);
  return json.map(
    (item: { _serializedHistory: string; username: string; date: string; id: string }) =>
      new HighScore(item._serializedHistory, item.username, new Date(item.date), item.id),
  );
};

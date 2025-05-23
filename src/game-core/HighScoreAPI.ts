import type { CryptoPriceGuess } from './GameCore';

export class HighScore {
  id?: string;
  username: string;
  score: number;
  date: Date;
  private _serializedHistory: string;

  constructor(historyOrSerialized: CryptoPriceGuess[] | string, username: string, date?: Date, id?: string) {
    this.username = username;
    this.id = id;
    this.date = date ?? new Date();

    if (Array.isArray(historyOrSerialized)) {
      this._serializedHistory = HighScore.serializeHistory(historyOrSerialized);
    } else {
      this.validateSerializedHistory(historyOrSerialized);
      this._serializedHistory = historyOrSerialized;
    }
    this.score = this.calculateScoreFromSerialized(this._serializedHistory);
  }

  public static serializeHistory(priceGuessHistory: CryptoPriceGuess[]): string {
    const counts = priceGuessHistory.reduce(
      (acc, guess) => {
        if (guess.isCorrect === undefined) {
          acc.noGuess++;
        } else if (guess.isCorrect) {
          acc.correct++;
        } else {
          acc.wrong++;
        }
        return acc;
      },
      { correct: 0, wrong: 0, noGuess: 0 },
    );

    return `C${counts.correct},W${counts.wrong},N${counts.noGuess}`;
  }

  private validateSerializedHistory(serialized: string): void {
    const parts = serialized.split(',');
    const errorMessage = `Invalid serialized history format. Expected format: C<number>,W<number>,N<number>. Got: ${serialized}`;

    if (parts.length !== 3) {
      throw new Error(errorMessage);
    }

    parts.forEach((part) => {
      const letter = part[0];
      const num = parseInt(part.slice(1));
      if (isNaN(num)) {
        throw new Error(errorMessage);
      }
      if (letter !== 'C' && letter !== 'W' && letter !== 'N') {
        throw new Error(errorMessage);
      }
    });
  }

  private calculateScoreFromSerialized(serialized: string): number {
    const [correct, wrong] = serialized.split(',').map((part) => parseInt(part.slice(1)));
    return correct - wrong;
  }

  get serializedHistory(): string {
    return this._serializedHistory;
  }
}

export type GetHighScore = () => Promise<HighScore[]>;
export type SaveHighScore = (
  priceGuessHistory: CryptoPriceGuess[],
  username: string,
) => Promise<{ id: string; date: Date }>;

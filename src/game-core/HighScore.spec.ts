import { describe, it, expect } from 'vitest';
import { HighScore } from './HighScoreAPI';
import { GuessDirection, type CryptoPriceGuess, type CryptoPrice } from './GameCore';

describe('HighScore', () => {
  const defaultPrice: CryptoPrice = {
    name: 'BTC',
    ammount: 100,
    timestamp: Date.now(),
  };

  const createPriceGuess = (override: Partial<CryptoPriceGuess> = {}): CryptoPriceGuess => ({
    price: defaultPrice,
    guess: null,
    isCorrect: undefined,
    direction: null,
    ...override,
  });

  it('creates a high score with correct values and serializes history', () => {
    const username = 'test_user';
    const priceGuessHistory: CryptoPriceGuess[] = [
      createPriceGuess({ isCorrect: true, guess: GuessDirection.Up, direction: GuessDirection.Up }),
      createPriceGuess({ isCorrect: true, guess: GuessDirection.Down, direction: GuessDirection.Down }),
      createPriceGuess({ isCorrect: false, guess: GuessDirection.Up, direction: GuessDirection.Down }),
      createPriceGuess(),
    ];

    const highScore = new HighScore(priceGuessHistory, username);

    expect(highScore.username).toBe(username);
    expect(highScore.score).toBe(1); // 2 correct, 1 incorrect, 1 undefined = 1
    expect(highScore.date).toBeInstanceOf(Date);
    expect(highScore.serializedHistory).toBe('C2,W1,N1');
  });

  it('handles empty price guess history', () => {
    const highScore = new HighScore([], 'test_user');
    expect(highScore.score).toBe(0);
    expect(highScore.serializedHistory).toBe('C0,W0,N0');
  });

  describe('optional constructor arguments', () => {
    it('uses provided date and id', () => {
      const date = new Date('2024-01-01');
      const id = 'test-id-123';
      const highScore = new HighScore('C2,W1,N0', 'test_user', date, id);

      expect(highScore.date).toBe(date);
      expect(highScore.id).toBe(id);
    });

    it('uses current date when no date is provided', () => {
      const highScore = new HighScore('C2,W1,N0', 'test_user');
      const now = new Date();

      // Allow for small time difference between creation and test
      expect(Math.abs(highScore.date.getTime() - now.getTime())).toBeLessThan(1000);
    });

    it('handles undefined id', () => {
      const highScore = new HighScore('C2,W1,N0', 'test_user');
      expect(highScore.id).toBeUndefined();
    });
  });

  describe('serialized history constructor', () => {
    it('creates a high score from valid serialized history', () => {
      const highScore = new HighScore('C2,W1,N1', 'test_user');
      expect(highScore.username).toBe('test_user');
      expect(highScore.score).toBe(1); // 2 correct - 1 wrong = 1
      expect(highScore.serializedHistory).toBe('C2,W1,N1');
    });

    it('throws error for invalid format', () => {
      expect(() => new HighScore('invalid', 'test_user')).toThrow(
        'Invalid serialized history format. Expected format: C<number>,W<number>,N<number>. Got: invalid',
      );
    });

    it('throws error for missing parts', () => {
      expect(() => new HighScore('C2,W1', 'test_user')).toThrow(
        'Invalid serialized history format. Expected format: C<number>,W<number>,N<number>. Got: C2,W1',
      );
    });

    it('throws error for invalid numbers', () => {
      expect(() => new HighScore('C2,Wabc,N1', 'test_user')).toThrow(
        'Invalid serialized history format. Expected format: C<number>,W<number>,N<number>. Got: C2,Wabc,N1',
      );
    });

    it('calculates score correctly from serialized history', () => {
      const testCases = [
        { serialized: 'C3,W1,N0', expectedScore: 2 }, // 3 correct - 1 wrong = 2
        { serialized: 'C1,W2,N1', expectedScore: -1 }, // 1 correct - 2 wrong = -1
        { serialized: 'C0,W0,N3', expectedScore: 0 }, // 0 correct - 0 wrong = 0
        { serialized: 'C5,W5,N0', expectedScore: 0 }, // 5 correct - 5 wrong = 0
      ];

      testCases.forEach(({ serialized, expectedScore }) => {
        const highScore = new HighScore(serialized, 'test_user');
        expect(highScore.score).toBe(expectedScore);
      });
    });
  });

  describe('static serializeHistory', () => {
    it('correctly serializes price guess history', () => {
      const priceGuessHistory: CryptoPriceGuess[] = [
        createPriceGuess({ isCorrect: true }),
        createPriceGuess({ isCorrect: false }),
        createPriceGuess(),
      ];

      const serialized = HighScore.serializeHistory(priceGuessHistory);
      expect(serialized).toBe('C1,W1,N1');
    });

    it('handles empty history', () => {
      const serialized = HighScore.serializeHistory([]);
      expect(serialized).toBe('C0,W0,N0');
    });
  });
});

import { describe, it, expect, vi, type MockedFunction, beforeEach, afterEach } from 'vitest';

import GameCore, {
  GuessDirection,
  type CryptoPrice,
  type CryptoPriceFetcher,
  type CryptoPriceGuess,
  type GameConfig,
  type GameSession,
} from './GameCore';

describe('GameCore', () => {
  const defaultPrice: CryptoPrice = {
    name: 'BTC',
    ammount: 100,
    timestamp: Date.now(),
  };

  const getPriceFetcherMock = (resolvedValue: CryptoPrice = defaultPrice): MockedFunction<CryptoPriceFetcher> => {
    return vi.fn().mockResolvedValue(resolvedValue);
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is created with the initialized state, no price history, no score, no guess and default config', () => {
    const game = new GameCore(getPriceFetcherMock());
    expect(game.state.value).toEqual('initialized');
    expect(game.currentPrice.value).toBeNull();
    expect(game.currentGuess.value).toBeNull();
    expect(game.canGuess.value).toBe(false);
    expect(game.hasGuessed.value).toBe(false);
    expect(game.priceHistory.value).toEqual([]);
    expect(game.score.value).toBe(0);
    expect(game.config).toEqual({
      poolInterval: 5000,
      cryptoName: 'BTC',
      session: null,
    });
  });

  describe('config', () => {
    it('uses custom config values when provided', async () => {
      const mockFetcher = getPriceFetcherMock();
      const customConfig: GameConfig = {
        poolInterval: 10000,
        cryptoName: 'ETH',
        session: null,
      };
      const game = new GameCore(mockFetcher, customConfig);

      game.start();
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');

      // Custom cryptoName should be "ETH"
      expect(mockFetcher).toHaveBeenCalledWith(customConfig.cryptoName);

      // Check if the custom poolInterval (10000ms) is respected
      vi.advanceTimersByTime(9900);
      expect(mockFetcher).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(200);
      expect(mockFetcher).toHaveBeenCalledTimes(2);
    });

    it('initializes price history from provided GameSession', () => {
      const mockFetcher = getPriceFetcherMock();
      const priceGuessHistory: CryptoPriceGuess[] = [
        {
          price: { name: 'BTC', ammount: 100, timestamp: Date.now() },
          guess: GuessDirection.Up,
          isCorrect: true,
          direction: GuessDirection.Up,
        },
        {
          price: { name: 'BTC', ammount: 90, timestamp: Date.now() },
          guess: GuessDirection.Down,
          isCorrect: true,
          direction: GuessDirection.Down,
        },
      ];
      const customConfig: GameConfig = {
        poolInterval: 5000,
        cryptoName: 'BTC',
        session: { priceGuessHistory },
      };
      const game = new GameCore(mockFetcher, customConfig);

      expect(game.priceHistory.value).toEqual(priceGuessHistory);
      expect(game.state.value).toEqual('initialized');
      expect(game.currentPrice.value).toBeNull();
      expect(game.currentGuess.value).toBeNull();
      // The score must be correct based on the price guess history
      expect(game.score.value).toBe(2);
    });
  });

  describe('start', () => {
    it('transitions to running state, starts polling price fetching, updates currentPrice and price history', async () => {
      const mockFetcher = getPriceFetcherMock();
      const game = new GameCore(mockFetcher);

      game.start();
      expect(game.state.value).toEqual('blocked');
      expect(game.currentPrice.value).toBeNull();

      vi.runAllTimers();

      await vi.waitUntil(() => game.state.value === 'running');

      expect(mockFetcher).toHaveBeenCalledWith('BTC');
      expect(game.currentPrice.value).toEqual(defaultPrice);
      expect(game.priceHistory.value).toEqual([
        {
          price: defaultPrice,
          guess: null,
          isCorrect: undefined,
          direction: null,
        },
      ]);
    });

    it('clears internal state when newGame is true', async () => {
      const mockFetcher = getPriceFetcherMock();
      const initialSession: GameSession = {
        priceGuessHistory: [
          {
            price: { name: 'BTC', ammount: 100, timestamp: Date.now() },
            guess: GuessDirection.Up,
            isCorrect: true,
            direction: GuessDirection.Up,
          },
          {
            price: { name: 'BTC', ammount: 90, timestamp: Date.now() },
            guess: GuessDirection.Down,
            isCorrect: true,
            direction: GuessDirection.Down,
          },
        ],
      };

      const game = new GameCore(mockFetcher, {
        poolInterval: 5000,
        cryptoName: 'BTC',
        session: initialSession,
      });

      // Verify initial state with session
      expect(game.priceHistory.value).toEqual(initialSession.priceGuessHistory);
      expect(game.score.value).toBe(2);

      // Start with newGame=true
      game.start(true);
      expect(game.currentPrice.value).toBeNull();
      expect(game.currentGuess.value).toBeNull();
      expect(game.priceHistory.value).toEqual([]);
      expect(game.score.value).toBe(0);
    });

    it('preserves internal state when newGame is false', async () => {
      const mockFetcher = getPriceFetcherMock();
      const game = new GameCore(mockFetcher);

      // First start to populate some state
      game.start();
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');

      // Stop the game
      game.stop();
      expect(game.state.value).toEqual('gameover');

      // Restart to get back to initialized state
      game.restart();
      expect(game.state.value).toEqual('initialized');

      // Start with newGame=false (default)
      game.start();
      expect(game.currentPrice.value).toBeNull();
      expect(game.currentGuess.value).toBeNull();
      expect(game.priceHistory.value).toEqual([]);
      expect(game.score.value).toBe(0);

      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');

      // Verify new state is populated correctly
      expect(game.currentPrice.value).toEqual(defaultPrice);
      expect(game.priceHistory.value).toEqual([
        {
          price: defaultPrice,
          guess: null,
          isCorrect: undefined,
          direction: null,
        },
      ]);
    });

    describe('when price fetch fails three times in a row', () => {
      it('transitions to gameover and currentPrice is null', async () => {
        const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Neat trick to make test wait for the fetch to fail
        let fetchCount = 0;
        const fetchError = new Error('Fetch failed');
        const mockFetcher = getPriceFetcherMock();
        mockFetcher.mockClear();
        mockFetcher.mockImplementation(async () => {
          fetchCount++;
          throw fetchError;
        });

        const game = new GameCore(mockFetcher);
        game.start();

        // First failure
        vi.runAllTimers();
        expect(mockFetcher).toHaveBeenCalledTimes(1);
        expect(game.state.value).toEqual('blocked');
        await vi.waitUntil(() => fetchCount === 1);

        // Second failure
        vi.runAllTimers();
        await vi.waitUntil(() => fetchCount === 2);
        expect(game.state.value).toEqual('blocked');
        expect(mockFetcher).toHaveBeenCalledTimes(2);

        // Third failure - should trigger ERROR event
        vi.runAllTimers();
        await vi.waitUntil(() => fetchCount === 3);
        expect(game.state.value).toEqual('error');

        expect(mockFetcher).toHaveBeenCalledTimes(3);
        expect(game.currentPrice.value).toBeNull();
        expect(logSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('does nothing when already in running state', async () => {
      const mockFetcher = getPriceFetcherMock();
      const game = new GameCore(mockFetcher);

      game.start();
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');

      expect(game.state.value).toEqual('running');
      expect(mockFetcher).toHaveBeenCalledTimes(1);

      game.start(); // Attempt to start again

      expect(game.state.value).toEqual('running');
      expect(mockFetcher).toHaveBeenCalledTimes(1);
      expect(game.currentPrice.value).toEqual(defaultPrice);
    });

    it('does nothing and does not fetch price when in gameover state', async () => {
      const mockFetcher = getPriceFetcherMock();
      const game = new GameCore(mockFetcher);

      game.start();
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');

      game.stop();
      game.start();

      expect(game.state.value).toEqual('gameover');
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('transitions from running to gameover state and stops polling', async () => {
      const mockFetcher = getPriceFetcherMock();
      const game = new GameCore(mockFetcher);

      game.start();
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');

      expect(mockFetcher).toHaveBeenCalledTimes(1);
      game.stop();
      expect(game.state.value).toEqual('gameover');

      // Run timers again to verify no more polling occurs
      vi.runAllTimers();
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    it('does nothing when not in running state', () => {
      const game = new GameCore(getPriceFetcherMock());
      const initialState = game.state.value;
      game.stop();
      expect(game.state.value).toEqual(initialState);
    });
  });

  describe('restart', () => {
    it('transitions from gameover to initialized state and clears internal state', async () => {
      const game = new GameCore(getPriceFetcherMock());

      game.start();
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');

      game.stop();
      expect(game.state.value).toEqual('gameover');

      game.restart();

      expect(game.state.value).toEqual('initialized');
      expect(game.currentPrice.value).toBeNull();
      expect(game.currentGuess.value).toBeNull();
      expect(game.canGuess.value).toBe(false);
      expect(game.hasGuessed.value).toBe(false);
      expect(game.priceHistory.value).toEqual([]);
      expect(game.score.value).toBe(0);
    });

    it('does nothing when not in gameover state', () => {
      const game = new GameCore(getPriceFetcherMock());
      const initialState = game.state.value;
      game.restart();
      expect(game.state.value).toEqual(initialState);
    });
  });

  describe('guess', () => {
    it('does nothing when not in running state', () => {
      const game = new GameCore(getPriceFetcherMock());

      game.guess(GuessDirection.Up);

      expect(game.currentGuess.value).toBeNull();
      expect(game.canGuess.value).toBe(false);
      expect(game.hasGuessed.value).toBe(false);

      // Try to guess when state is blocked
      game.start();
      expect(game.state.value).toEqual('blocked');
      game.guess(GuessDirection.Up);

      expect(game.currentGuess.value).toBeNull();
      expect(game.canGuess.value).toBe(false);
      expect(game.hasGuessed.value).toBe(false);
    });

    it('sets the current guess, updates price history guess, direction and correct value until the next price fetch', async () => {
      const mockFetcher = getPriceFetcherMock();

      const expectedFirstPriceGuess = {
        price: defaultPrice,
        guess: null,
        isCorrect: undefined,
        direction: null,
      };

      const expectedSecondPriceGuess = {
        price: {
          ...defaultPrice,
          ammount: 200,
        },
        guess: GuessDirection.Up,
        isCorrect: true,
        direction: GuessDirection.Up,
      };

      const expectedThirdPriceGuess = {
        price: {
          ...defaultPrice,
          ammount: 300,
        },
        guess: GuessDirection.Down,
        isCorrect: false,
        direction: GuessDirection.Up,
      };

      mockFetcher
        .mockResolvedValueOnce(defaultPrice)
        .mockResolvedValueOnce(expectedSecondPriceGuess.price)
        .mockResolvedValueOnce(expectedThirdPriceGuess.price);

      const game = new GameCore(mockFetcher);

      game.start();

      // Wait for the first price fetch - €100
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');

      expect(game.currentGuess.value).toBeNull();
      expect(game.canGuess.value).toBe(true);
      expect(game.hasGuessed.value).toBe(false);

      // First guess is CORRECT: 200 > 100
      game.guess(GuessDirection.Up);

      // Validate state of first guess
      expect(game.currentGuess.value).toEqual(GuessDirection.Up);
      expect(game.canGuess.value).toBe(false);
      expect(game.hasGuessed.value).toBe(true);

      // History will be updated once the next price is available
      expect(game.priceHistory.value).toEqual([
        {
          price: defaultPrice,
          guess: null,
          isCorrect: undefined,
          direction: null,
        },
      ]);

      // Wait for the next price fetch - €200
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');

      // Validate guess reset between price fetches
      expect(game.currentGuess.value).toBeNull();
      expect(game.canGuess.value).toBe(true);
      expect(game.hasGuessed.value).toBe(false);

      // Validate price guess history
      expect(game.priceHistory.value).toEqual([expectedSecondPriceGuess, expectedFirstPriceGuess]);

      // Second guess is WRONG: 300 > 200
      game.guess(GuessDirection.Down);

      // Validate state of second guess
      expect(game.currentGuess.value).toEqual(GuessDirection.Down);
      expect(game.canGuess.value).toBe(false);
      expect(game.hasGuessed.value).toBe(true);

      // Wait for the next price fetch - €300
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');

      // Validate guess reset between price fetches
      expect(game.currentGuess.value).toBeNull();
      expect(game.canGuess.value).toBe(true);
      expect(game.hasGuessed.value).toBe(false);

      // Validate price guess history
      expect(game.priceHistory.value).toEqual([
        expectedThirdPriceGuess,
        expectedSecondPriceGuess,
        expectedFirstPriceGuess,
      ]);
    });

    it('does nothing when already guessed', async () => {
      const game = new GameCore(getPriceFetcherMock());

      game.start();
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');

      // First guess
      game.guess(GuessDirection.Up);

      expect(game.currentGuess.value).toEqual(GuessDirection.Up);
      expect(game.canGuess.value).toBe(false);
      expect(game.hasGuessed.value).toBe(true);

      // Second guess - must be ignored
      game.guess(GuessDirection.Down);

      expect(game.currentGuess.value).toEqual(GuessDirection.Up);
      expect(game.canGuess.value).toBe(false);
      expect(game.hasGuessed.value).toBe(true);
    });
  });

  describe('score', () => {
    it('increments by 1 for each correct guess', async () => {
      // Setup price changes: 100 -> 200 -> 300
      const mockFetcher = getPriceFetcherMock();
      mockFetcher
        .mockResolvedValueOnce({ ...defaultPrice, ammount: 100 })
        .mockResolvedValueOnce({ ...defaultPrice, ammount: 200 })
        .mockResolvedValueOnce({ ...defaultPrice, ammount: 300 });

      const game = new GameCore(mockFetcher);
      game.start();

      // Initial price fetch (100)
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');
      expect(game.score.value).toBe(0);

      // First correct guess (UP)
      game.guess(GuessDirection.Up);
      vi.runAllTimers();
      await vi.waitUntil(() => game.currentGuess.value === null);
      expect(game.score.value).toBe(1);

      // Second correct guess (UP)
      game.guess(GuessDirection.Up);
      vi.runAllTimers();
      await vi.waitUntil(() => game.currentGuess.value === null);
      expect(game.score.value).toBe(2);
    });

    it('decrements by 1 for each incorrect guess', async () => {
      // Setup price changes: 100 -> 50 -> 25
      const mockFetcher = getPriceFetcherMock();
      mockFetcher
        .mockResolvedValueOnce({ ...defaultPrice, ammount: 100 })
        .mockResolvedValueOnce({ ...defaultPrice, ammount: 50 })
        .mockResolvedValueOnce({ ...defaultPrice, ammount: 25 });

      const game = new GameCore(mockFetcher);
      game.start();

      // Initial price fetch (100)
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');
      expect(game.score.value).toBe(0);

      // First incorrect guess (UP when price goes DOWN)
      game.guess(GuessDirection.Up);
      vi.runAllTimers();
      await vi.waitUntil(() => game.currentGuess.value === null);
      expect(game.score.value).toBe(-1);

      // Second incorrect guess (UP when price goes DOWN)
      game.guess(GuessDirection.Up);
      vi.runAllTimers();
      await vi.waitUntil(() => game.currentGuess.value === null);
      expect(game.score.value).toBe(-2);
    });

    it('does not change score when no guesses are made', async () => {
      // Setup price changes: 100 -> 200 -> 300
      const mockFetcher = getPriceFetcherMock();
      mockFetcher
        .mockResolvedValueOnce({ ...defaultPrice, ammount: 100 })
        .mockResolvedValueOnce({ ...defaultPrice, ammount: 200 })
        .mockResolvedValueOnce({ ...defaultPrice, ammount: 300 });

      const game = new GameCore(mockFetcher);
      game.start();

      // Initial price fetch (100)
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');
      expect(game.score.value).toBe(0);

      // First price change without guess
      vi.runAllTimers();
      await vi.waitUntil(() => game.currentPrice.value?.ammount === 200);
      expect(game.score.value).toBe(0);

      // Second price change without guess
      vi.runAllTimers();
      await vi.waitUntil(() => game.currentPrice.value?.ammount === 300);
      expect(game.score.value).toBe(0);
    });
  });
});

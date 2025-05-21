import { describe, it, expect, vi, type MockedFunction, beforeEach, afterEach } from 'vitest';

import GameCore, { GuessDirection, type CryptoPrice, type CryptoPriceFetcher } from './GameCore';

describe('GameCore', () => {
  const defaultPrice: CryptoPrice = {
    name: 'BTC',
    price: 100,
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

  it('is created with the initialized state, no price history, and no guess', () => {
    const game = new GameCore(getPriceFetcherMock());
    expect(game.state.value).toEqual('initialized');
    expect(game.currentPrice.value).toBeNull();
    expect(game.currentGuess.value).toBeNull();
    expect(game.canGuess.value).toBe(false);
    expect(game.hasGuessed.value).toBe(false);
  });

  describe('start', () => {
    it('transitions to running state, starts polling price fetching, and updates currentPrice', async () => {
      const mockFetcher = getPriceFetcherMock();
      const game = new GameCore(mockFetcher);

      game.start();
      expect(game.state.value).toEqual('blocked');
      expect(game.currentPrice.value).toBeNull();

      vi.runAllTimers();

      await vi.waitUntil(() => game.state.value === 'running');

      expect(mockFetcher).toHaveBeenCalledWith('BTC');
      expect(game.currentPrice.value).toEqual(defaultPrice);
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

    it('sets the current guess until the next price fetch', async () => {
      const game = new GameCore(getPriceFetcherMock());

      game.start();

      // Wait for the first price fetch
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');

      expect(game.currentGuess.value).toBeNull();
      expect(game.canGuess.value).toBe(true);
      expect(game.hasGuessed.value).toBe(false);

      game.guess(GuessDirection.Up);

      // Validate first guess
      expect(game.currentGuess.value).toEqual(GuessDirection.Up);
      expect(game.canGuess.value).toBe(false);
      expect(game.hasGuessed.value).toBe(true);

      // Wait for the next price fetch
      vi.runAllTimers();
      await vi.waitUntil(() => game.state.value === 'running');

      // Validate guess reset
      expect(game.currentGuess.value).toBeNull();
      expect(game.canGuess.value).toBe(true);
      expect(game.hasGuessed.value).toBe(false);

      // Second guess
      game.guess(GuessDirection.Down);

      // Validate second guess
      expect(game.currentGuess.value).toEqual(GuessDirection.Down);
      expect(game.canGuess.value).toBe(false);
      expect(game.hasGuessed.value).toBe(true);
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
});

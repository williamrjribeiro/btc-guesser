import { describe, it, expect, vi, type MockedFunction } from 'vitest';

import GameCore, { type CryptoPrice, type CryptoPriceFetcher } from './GameCore';

describe('GameCore', () => {
  const defaultPrice: CryptoPrice = {
    name: 'BTC',
    price: 100,
    timestamp: Date.now(),
  };

  const getPriceFetcherMock = (resolvedValue: CryptoPrice = defaultPrice): MockedFunction<CryptoPriceFetcher> => {
    return vi.fn().mockResolvedValue(resolvedValue);
  };

  it('is created with the initialized state and no price history', () => {
    const game = new GameCore(getPriceFetcherMock());
    expect(game.state.value).toEqual('initialized');
  });

  describe('start', () => {
    it('transitions from initialized to running, fetches price, and sets currentPrice', async () => {
      const mockFetcher = getPriceFetcherMock();
      const game = new GameCore(mockFetcher);

      await game.start();

      expect(mockFetcher).toHaveBeenCalledWith('BTC');
      expect(game.currentPrice.value).toEqual(defaultPrice);
      expect(game.state.value).toEqual('running');
    });

    it('transitions to gameover and currentPrice is null when price fetch fails', async () => {
      const fetchError = new Error('Fetch failed');
      const mockFetcher = getPriceFetcherMock();
      mockFetcher.mockClear();
      mockFetcher.mockRejectedValue(fetchError);

      const game = new GameCore(mockFetcher);

      await expect(game.start()).rejects.toThrow(fetchError);

      expect(mockFetcher).toHaveBeenCalledWith('BTC');
      expect(game.currentPrice.value).toBeNull();
      expect(game.state.value).toEqual('gameover');
    });

    it('does nothing when already in running state', async () => {
      const mockFetcher = getPriceFetcherMock();
      const game = new GameCore(mockFetcher);

      await game.start();

      expect(game.state.value).toEqual('running');
      expect(mockFetcher).toHaveBeenCalledTimes(1);

      await game.start(); // Attempt to start again

      expect(game.state.value).toEqual('running');
      expect(mockFetcher).toHaveBeenCalledTimes(1);
      expect(game.currentPrice.value).toEqual(defaultPrice);
    });

    it('does nothing and does not fetch price when in gameover state', async () => {
      const mockFetcher = getPriceFetcherMock();
      const game = new GameCore(mockFetcher);

      await game.start();
      game.stop();
      await game.start();

      expect(game.state.value).toEqual('gameover');
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('transitions from running to gameover state', async () => {
      const game = new GameCore(getPriceFetcherMock());

      await game.start();
      game.stop();

      expect(game.state.value).toEqual('gameover');
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

      await game.start();
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
});

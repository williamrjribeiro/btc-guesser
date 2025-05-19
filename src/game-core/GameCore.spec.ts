import { describe, it, expect, vi, type MockedFunction } from 'vitest';

import GameCore, { type CryptoPrice, type CryptoPriceFetcher } from './GameCore';

describe('GameCore', () => {
    const defaultPrice: CryptoPrice = {
        name: 'BTC',
        price: 100,
        timestamp: Date.now(),
    };

    it('is created with the initialized state and no price history', () => {
        const game = new GameCore(getPriceFetcherMock());
        expect(game.state.value).toEqual('initialized');
    });

    describe('start', () => {
        it('transitions from initialized to running state', () => {
            const game = new GameCore(getPriceFetcherMock());
            game.start();
            expect(game.state.value).toEqual('running');
        });

        it('does nothing when already in running state', () => {
            const game = new GameCore(getPriceFetcherMock());
            game.start();
            const currentState = game.state.value;
            game.start();
            expect(game.state.value).toEqual(currentState);
        });
    });

    describe('stop', () => {
        it('transitions from running to gameover state', () => {
            const game = new GameCore(getPriceFetcherMock());
            game.start();
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
        it('transitions from gameover to initialized state', () => {
            const game = new GameCore(getPriceFetcherMock());
            game.start();
            game.stop();
            expect(game.state.value).toEqual('gameover');

            game.restart();
            expect(game.state.value).toEqual('initialized');
        });

        it('does nothing when not in gameover state', () => {
            const game = new GameCore(getPriceFetcherMock());
            const initialState = game.state.value;
            game.restart();
            expect(game.state.value).toEqual(initialState);
        });
    });

    const getPriceFetcherMock = (): MockedFunction<CryptoPriceFetcher> => vi.fn().mockResolvedValue(defaultPrice);
});

import { Signal, signal, computed } from '@preact/signals';

type GameState = 'initialized' | 'running' | 'gameover';

export type CryptoPrice = {
    name: string;
    price: number;
    timestamp: number;
};

export type CryptoPriceFetcher = (cryptoName: string) => Promise<CryptoPrice>;

class GameCore {
    private _state: Signal<GameState>;
    public readonly state = computed(() => this._state.value);
    private _currentPrice = signal<CryptoPrice | null>(null);
    public readonly currentPrice = computed(() => this._currentPrice.value);

    constructor(private readonly cryptoPriceFetcher: CryptoPriceFetcher) {
        this._state = signal('initialized');
    }

    public async start() {
        if (this._state.value !== 'initialized') {
            return;
        }

        try {
            // Assuming 'BTC' for now, this could be configurable
            const priceData = await this.cryptoPriceFetcher('BTC');
            this._currentPrice.value = priceData;
            this._state.value = 'running';
        } catch (error) {
            console.error("Failed to fetch initial crypto price:", error);
            this._currentPrice.value = null;
            this._state.value = 'gameover'; // Or a dedicated error state
        }
    }

    public stop() {
        if (this._state.value !== 'running') {
            return;
        }
        // In a real game, 'stop' might mean something else, like pausing or finishing a round.
        // For now, it transitions to gameover.
        this._state.value = 'gameover';
    }

    public restart() {
        if (this._state.value !== 'gameover') {
            return;
        }

        this._currentPrice.value = null;
        this._state.value = 'initialized';
    }
}

export default GameCore;

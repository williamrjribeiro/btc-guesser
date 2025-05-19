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
    public state = computed(() => this._state.value);
    private currentPrice: CryptoPrice | null = null;

    constructor(private readonly cryptoPriceFetcher: CryptoPriceFetcher) {
        this._state = signal('initialized');
        this.currentPrice = null;
    }

    public start() {
        if (this._state.value !== 'initialized') {
            return;
        }

        this._state.value = 'running';
    }

    public stop() {
        if (this._state.value !== 'running') {
            return;
        }

        this._state.value = 'gameover';
    }

    public restart() {
        if (this._state.value !== 'gameover') {
            return;
        }

        this.currentPrice = null;
        this._state.value = 'initialized';
    }
}

export default GameCore;

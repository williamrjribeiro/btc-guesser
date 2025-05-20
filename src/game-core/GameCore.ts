import { Signal, signal, computed } from '@preact/signals';
import Pollinator from 'pollinator';

type GameState = 'initialized' | 'blocked' | 'running' | 'gameover' | 'error';

export type CryptoPrice = {
  name: string;
  price: number;
  timestamp: number;
};

export type CryptoPriceFetcher = (cryptoName: string) => Promise<CryptoPrice>;

class GameCore {
  private _state: Signal<GameState>;
  public readonly state = computed(() => this._state.value);

  private _currentPrice: Signal<CryptoPrice | null>;
  public readonly currentPrice = computed(() => this._currentPrice.value);

  private poller: Pollinator;

  constructor(private readonly cryptoPriceFetcher: CryptoPriceFetcher) {
    this._state = signal('initialized');
    this._currentPrice = signal(null);

    this.poller = new Pollinator(
      () => {
        this._state.value = 'blocked';
        return this.cryptoPriceFetcher('BTC');
      },
      { failRetryCount: 2 },
    );

    this.poller.on(Pollinator.Event.POLL, (...price: unknown[]) => {
      this._currentPrice.value = price[0] as CryptoPrice;
      this._state.value = 'running';
    });

    this.poller.on(Pollinator.Event.ERROR, (...args) => {
      console.error('[GameCore] could not fetch price:', ...args);
      this._currentPrice.value = null;
      this._state.value = 'error';
    });
  }

  public start() {
    if (this._state.value !== 'initialized') {
      return;
    }
    this.poller.start();
  }

  public stop() {
    if (this._state.value !== 'running') {
      return;
    }
    this.poller.stop();
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

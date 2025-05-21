import { Signal, signal, computed } from '@preact/signals';
import Pollinator from 'pollinator';

type GameState = 'initialized' | 'blocked' | 'running' | 'gameover' | 'error';

export type CryptoPrice = {
  name: string;
  price: number;
  timestamp: number;
};

export type CryptoPriceFetcher = (cryptoName: string) => Promise<CryptoPrice>;

export enum GuessDirection {
  Up = 'up',
  Down = 'down',
}

class GameCore {
  private _state: Signal<GameState>;
  public readonly state = computed(() => this._state.value);

  private _currentPrice: Signal<CryptoPrice | null>;
  public readonly currentPrice = computed(() => this._currentPrice.value);

  private _guess: Signal<GuessDirection | null>;
  public readonly currentGuess = computed(() => this._guess.value);
  public readonly hasGuessed = computed(() => this.currentGuess.value !== null);
  public readonly canGuess = computed(() => this.state.value === 'running' && !this.hasGuessed.value);

  private poller: Pollinator;

  constructor(private readonly cryptoPriceFetcher: CryptoPriceFetcher) {
    this._state = signal('initialized');
    this._currentPrice = signal(null);
    this._guess = signal(null);

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
      this._guess.value = null;
    });

    this.poller.on(Pollinator.Event.ERROR, (...args) => {
      console.error('[GameCore] could not fetch price:', ...args);
      this._currentPrice.value = null;
      this._state.value = 'error';
    });
  }

  public start() {
    if (this.state.value !== 'initialized') {
      return;
    }
    this.poller.start();
  }

  public stop() {
    if (this.state.value !== 'running') {
      return;
    }

    this.poller.stop();
    this._state.value = 'gameover';
  }

  public restart() {
    if (this.state.value !== 'gameover') {
      return;
    }

    this._currentPrice.value = null;
    this._guess.value = null;
    this._state.value = 'initialized';
  }

  public guess(direction: GuessDirection) {
    if (!this.canGuess.value) {
      return;
    }
    this._guess.value = direction;
  }
}

export default GameCore;

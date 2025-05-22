import { Signal, signal, computed } from '@preact/signals';
import Pollinator from 'pollinator';

export type GameState = 'initialized' | 'blocked' | 'running' | 'gameover' | 'error';

export type CryptoPrice = {
  name: string;
  ammount: number;
  timestamp: number;
};

export type CryptoPriceGuess = {
  price: CryptoPrice;
  guess: GuessDirection | null;
  isCorrect: boolean | undefined;
  direction: GuessDirection | null;
};

export type CryptoPriceFetcher = (cryptoName: string) => Promise<CryptoPrice>;

export enum GuessDirection {
  Up = 'up',
  Down = 'down',
}

export type GameConfig = {
  poolInterval: number;
  cryptoName: string;
};

const DEFAULT_CONFIG: GameConfig = {
  poolInterval: 5000,
  cryptoName: 'BTC',
};

class GameCore {
  private _state: Signal<GameState>;
  public readonly state = computed(() => this._state.value);

  private _currentPrice: Signal<CryptoPrice | null>;
  public readonly currentPrice = computed(() => this._currentPrice.value);

  private _priceHistory: Signal<CryptoPriceGuess[]>;
  public readonly priceHistory = computed(() => this._priceHistory.value);

  private _guess: Signal<GuessDirection | null>;
  public readonly currentGuess = computed(() => this._guess.value);
  public readonly hasGuessed = computed(() => this.currentGuess.value !== null);
  public readonly canGuess = computed(() => this.state.value === 'running' && !this.hasGuessed.value);

  private _score: Signal<number>;
  public readonly score = computed(() => this._score.value);

  private poller: Pollinator;

  constructor(
    private readonly cryptoPriceFetcher: CryptoPriceFetcher,
    private readonly config: GameConfig = DEFAULT_CONFIG,
  ) {
    this._state = signal('initialized');
    this._currentPrice = signal(null);
    this._guess = signal(null);
    this._priceHistory = signal([]);
    this._score = signal(0);
    this.poller = new Pollinator(
      () => {
        this._state.value = 'blocked';
        return this.cryptoPriceFetcher(this.config.cryptoName);
      },
      { failRetryCount: 2, delay: this.config.poolInterval },
    );

    this.poller.on(Pollinator.Event.POLL, (...price: unknown[]) => {
      const newPrice = price[0] as CryptoPrice;
      this._currentPrice.value = newPrice;
      const lastPrice = this.priceHistory.value[0];
      let isCorrect: boolean | undefined;
      let direction: GuessDirection | null = null;

      if (lastPrice) {
        // TODO: what if the price is the same? Bug in the specs? ¯\_(ツ)_/¯
        direction = lastPrice.price.ammount > newPrice.ammount ? GuessDirection.Down : GuessDirection.Up;
        if (this.hasGuessed.value) {
          isCorrect = this.currentGuess.value === direction;
          // Update score based on guess correctness
          if (isCorrect) {
            this._score.value += 1;
          } else {
            this._score.value -= 1;
          }
        }
      }

      this._priceHistory.value = [
        { price: newPrice, guess: this.currentGuess.value, isCorrect, direction },
        ...this._priceHistory.value,
      ];

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
    this._priceHistory.value = [];
    this._score.value = 0;
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

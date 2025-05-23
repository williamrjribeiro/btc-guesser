import { type ForPersistingGameHistory } from '../game-core/LocalHistory';
import GameCore, { type GameSession } from '../game-core/GameCore';
import { effect } from '@preact/signals';

const STORAGE_KEY = 'btc-guesser-session';

export class LocalStorageHistory implements ForPersistingGameHistory {
  private unsubscribe: (() => void) | null = null;

  watch(gameCore: GameCore): void {
    // Clean up any existing subscription
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // Subscribe to changes in priceGuessHistory and game state
    this.unsubscribe = effect(() => {
      // Clear history when game is over
      if (gameCore.state.value === 'gameover') {
        this.clear();
        return;
      }

      const session: GameSession = {
        priceGuessHistory: gameCore.priceHistory.value,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } catch (error) {
        console.error('Failed to save game session:', error);
      }
    });
  }

  load(): GameSession | null {
    try {
      const storedSession = localStorage.getItem(STORAGE_KEY);
      if (!storedSession) return null;

      return JSON.parse(storedSession) as GameSession;
    } catch (error) {
      console.error('Failed to load game session:', error);
      return null;
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear game session:', error);
    }
  }
}

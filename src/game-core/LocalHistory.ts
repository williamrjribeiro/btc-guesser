import GameCore, { type GameSession } from './GameCore';

export interface ForPersistingGameHistory {
  watch(gameCore: GameCore): void;
  load(): GameSession | null;
}

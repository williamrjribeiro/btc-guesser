import { mockCryptoPriceFetcher } from '../adapters/MockCryptoFetcher';
import GameCore, { type GameState } from '../game-core/GameCore';
import './app.css';
import { GameStartScreen } from './components/GameStartScreen';
import { GameLoopScreen } from './components/GameLoopScreen';
import { GameOverScreen } from './components/GameOverScreen';
import type { ComponentType } from 'preact';

const gameCore = new GameCore(mockCryptoPriceFetcher);

export interface GameScreenProps {
  gameCore: GameCore;
}

const SCREENS: Record<GameState, ComponentType<GameScreenProps>> = {
  initialized: GameStartScreen,
  running: GameLoopScreen,
  blocked: GameLoopScreen,
  gameover: GameOverScreen,
  error: () => <div>Error: Unknown game state</div>,
} as const;

export function App() {
  const Screen = SCREENS[gameCore.state.value as GameState];

  return (
    <div>
      <h1>🍀₿TC Guesser🍀</h1>
      <Screen gameCore={gameCore} />
    </div>
  );
}

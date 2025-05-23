import { mockCryptoPriceFetcher } from '../adapters/MockCryptoFetcher';
import GameCore, { GuessDirection, type GameSession, type GameState } from '../game-core/GameCore';
import './app.css';
import { GameStartScreen } from './components/GameStartScreen';
import { GameLoopScreen } from './components/GameLoopScreen';
import { GameOverScreen } from './components/GameOverScreen';
import type { ComponentType } from 'preact';


const TestSession: GameSession = {
  priceGuessHistory: [
    { price: { name: 'BTC', ammount: 100, timestamp: Date.now() }, guess: GuessDirection.Up, isCorrect: true, direction: GuessDirection.Up },
    { price: { name: 'BTC', ammount: 90, timestamp: Date.now() }, guess: GuessDirection.Down, isCorrect: true, direction: GuessDirection.Down },
  ],
};

const gameCore = new GameCore(mockCryptoPriceFetcher, { poolInterval: 5000, cryptoName: 'BTC', session: TestSession });

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
    <>
      <h1>🍀 ₿TC Guesser 🍀</h1>
      <Screen gameCore={gameCore} />
    </>
  );
}

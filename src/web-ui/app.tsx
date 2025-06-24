import { mockCryptoPriceFetcher } from '../adapters/MockCryptoFetcher';
import GameCore, { type GameState } from '../game-core/GameCore';
import './app.css';
import { GameStartScreen } from './screens/game-start/GameStartScreen';
import { GameLoopScreen } from './screens/game-loop/GameLoopScreen';
import { GameOverScreen } from './screens/game-over/GameOverScreen';
import { Footer } from './components/Footer';
import type { ComponentType } from 'preact';
import { LocalStorageHistory } from '../adapters/LocalStorageHistory';

const localStorageHistory = new LocalStorageHistory();
const persistedSession = localStorageHistory.load();
console.log('[app] persistedSession:', persistedSession);

const gameCore = new GameCore(mockCryptoPriceFetcher, {
  poolInterval: 5000,
  cryptoName: 'BTC',
  session: persistedSession,
});
localStorageHistory.watch(gameCore);

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
      <Footer />
    </>
  );
}

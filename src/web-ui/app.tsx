import { mockCryptoPriceFetcher } from '../adapters/MockCryptoFetcher';
import GameCore from '../game-core/GameCore';
import './app.css';

interface GameScreenProps {
  onActionClick: () => void;
}

const gameCore = new GameCore(mockCryptoPriceFetcher);

export function App() {
  return (
    <div>
      <h1>BTC Guesser</h1>
      {SCREENS[gameCore.state.value]({
        onActionClick: () => {
          switch (gameCore.state.value) {
            case 'initialized':
              gameCore.start();
              break;
            case 'running':
              gameCore.stop();
              break;
            case 'gameover':
              gameCore.restart();
              break;
          }
        },
      })}
    </div>
  );
}

const StartScreen = ({ onActionClick }: GameScreenProps) => {
  return (
    <div>
      <h2>Start Screen</h2>
      <button onClick={onActionClick}>Play</button>
    </div>
  );
};

const GameScreen = ({ onActionClick }: GameScreenProps) => {
  return (
    <div>
      <h2>Game Loop Screen</h2>
      <button onClick={onActionClick}>Quit</button>
    </div>
  );
};

const GameOverScreen = ({ onActionClick }: GameScreenProps) => {
  return (
    <div>
      <h2>Game Over!</h2>
      <button onClick={onActionClick}>Restart</button>
    </div>
  );
};

const SCREENS = {
  initialized: StartScreen,
  running: GameScreen,
  gameover: GameOverScreen,
} as const;

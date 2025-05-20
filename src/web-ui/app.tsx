import { mockCryptoPriceFetcher } from '../adapters/MockCryptoFetcher';
import GameCore from '../game-core/GameCore';
import './app.css';

interface BaseScreenProps {
  onActionClick: () => void | Promise<void>;
}

type StartScreenProps = BaseScreenProps;

interface GameLoopScreenProps extends BaseScreenProps {
  cryptoName: string;
  price: number;
}

type GameOverScreenProps = BaseScreenProps;

const gameCore = new GameCore(mockCryptoPriceFetcher);

export function App() {
  const renderScreen = () => {
    switch (gameCore.state.value) {
      case 'initialized':
        return <StartScreen onActionClick={() => gameCore.start()} />;
      case 'running': {
        const currentPrice = gameCore.currentPrice.value;
        if (!currentPrice) {
          // This case should ideally not happen if start() fetches price before setting state to 'running'
          // Or, we can show a loading indicator
          return <div>Loading price...</div>;
        }
        return (
          <GameLoopScreen
            cryptoName={currentPrice.name}
            price={currentPrice.price}
            onActionClick={() => gameCore.stop()}
          />
        );
      }
      case 'gameover':
        return <GameOverScreen onActionClick={() => gameCore.restart()} />;
      default:
        // Should not happen, but good to have a fallback or error message
        return <div>Error: Unknown game state</div>;
    }
  };

  return (
    <div>
      <h1>BTC Guesser</h1>
      {renderScreen()}
    </div>
  );
}

const StartScreen = ({ onActionClick }: StartScreenProps) => (
  <div>
    <h2>Start Screen</h2>
    <button onClick={onActionClick}>Play</button>
  </div>
);

const GameLoopScreen = ({ cryptoName, price, onActionClick }: GameLoopScreenProps) => {
  const userLocale = navigator.language || 'en-US'; // Fallback to en-US
  const formattedPrice = new Intl.NumberFormat(userLocale, {
    style: 'currency',
    currency: 'USD',
  }).format(price);

  return (
    <div>
      <h2>Game Loop Screen</h2>
      <h3>
        Current {cryptoName} Price: {formattedPrice}
      </h3>
      <button onClick={onActionClick}>Quit</button>
    </div>
  );
};

const GameOverScreen = ({ onActionClick }: GameOverScreenProps) => (
  <div>
    <h2>Game Over!</h2>
    <button onClick={onActionClick}>Restart</button>
  </div>
);

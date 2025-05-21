import type { Signal } from '@preact/signals';
import { mockCryptoPriceFetcher } from '../adapters/MockCryptoFetcher';
import GameCore, { GuessDirection, type CryptoPrice } from '../game-core/GameCore';
import './app.css';

interface BaseScreenProps {
  onActionClick: () => void | Promise<void>;
}

type StartScreenProps = BaseScreenProps;

interface GameLoopScreenProps {
  gameCore: GameCore;
}

type GameOverScreenProps = BaseScreenProps;

const gameCore = new GameCore(mockCryptoPriceFetcher);

export function App() {
  const renderScreen = () => {
    switch (gameCore.state.value) {
      case 'initialized':
        return (
          <StartScreen
            onActionClick={() => {
              gameCore.start();
            }}
          />
        );
      case 'running':
      case 'blocked':
        return <GameLoopScreen gameCore={gameCore} />;
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

const GameLoopScreen = ({ gameCore }: GameLoopScreenProps) => (
  <div>
    <h2 className={gameCore.state.value === 'blocked' ? 'blocked-header' : ''}>Game Loop Screen</h2>
    <CryptoPrice currentPrice={gameCore.currentPrice} />
    <GuessInput gameCore={gameCore} />
    <button onClick={() => gameCore.stop()}>Quit</button>
  </div>
);

const GuessButton = ({
  direction,
  disabled,
  onClick,
}: {
  direction: GuessDirection;
  disabled: boolean;
  onClick?: (direction: GuessDirection) => void;
}) => (
  <button disabled={disabled} onClick={() => onClick?.(direction)}>
    {direction == GuessDirection.Up ? 'Goes up ⬆️' : 'Goes down ⬇️'}
  </button>
);

const GuessInput = ({ gameCore }: { gameCore: GameCore }) => {
  if (gameCore.hasGuessed.value) {
    return <GuessButton direction={gameCore.currentGuess.value!} disabled={true} />;
  }
  const disableGuess = !gameCore.canGuess.value;

  return (
    <div>
      <div className="guess-buttons">
        <GuessButton
          direction={GuessDirection.Up}
          disabled={disableGuess}
          onClick={(direction) => gameCore.guess(direction)}
        />
        <GuessButton
          direction={GuessDirection.Down}
          disabled={disableGuess}
          onClick={(direction) => gameCore.guess(direction)}
        />
      </div>
      <div>
        <span>Current guess: {gameCore.currentGuess?.value}</span>
      </div>
    </div>
  );
};

const userLocale = navigator.language || 'en-US';
const priceFormatter = new Intl.NumberFormat(userLocale, {
  style: 'currency',
  currency: 'USD',
});

const CryptoPrice = ({ currentPrice }: { currentPrice: Signal<CryptoPrice | null> }) => {
  if (!currentPrice.value) {
    return <div>Loading price...</div>;
  }

  const formattedPrice = priceFormatter.format(currentPrice.value.price);

  return (
    <h3 style={{ display: 'flex', justifyContent: 'space-around' }}>
      <span>Current {currentPrice.value.name} Price:</span>
      <span>{formattedPrice}</span>
    </h3>
  );
};

const GameOverScreen = ({ onActionClick }: GameOverScreenProps) => (
  <div>
    <h2>Game Over!</h2>
    <button onClick={onActionClick}>Restart</button>
  </div>
);

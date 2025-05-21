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
      <h1>🍀₿TC Guesser🍀</h1>
      {renderScreen()}
    </div>
  );
}

const StartScreen = ({ onActionClick }: StartScreenProps) => (
  <div className="start">
    <div className="start__rules">
      <div className="start__rules-item">🎯 Guess if Bitcoin's price will go up or down in 1 minute</div>
      <div className="start__rules-item">💰 Score +1 for correct guesses, -1 for wrong ones</div>
      <div className="start__rules-item">⏳ One guess at a time - patience is a virtue!</div>
      <div className="start__rules-item">💾 Your score is saved - come back anytime!</div>
    </div>
    <button className="start__play" onClick={onActionClick}>
      🤞 Let's Play! 🤞
    </button>
  </div>
);

const GameLoopScreen = ({ gameCore }: GameLoopScreenProps) => (
  <div className="game">
    <CryptoPrice currentPrice={gameCore.currentPrice} />
    <GuessInput gameCore={gameCore} />
    <button className="game__quit" onClick={() => gameCore.stop()}>
      Quit
    </button>
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
  <button
    className={`guess-button guess-button--${direction === GuessDirection.Up ? 'up' : 'down'}`}
    disabled={disabled}
    onClick={() => onClick?.(direction)}
  >
    {direction == GuessDirection.Up ? 'Goes up ⬆️' : 'Goes down ⬇️'}
  </button>
);

const GuessInput = ({ gameCore }: { gameCore: GameCore }) => {
  if (gameCore.hasGuessed.value) {
    return (
      <div className="game__buttons">
        <GuessButton direction={gameCore.currentGuess.value!} disabled={true} />
      </div>
    );
  }
  const disableGuess = !gameCore.canGuess.value;

  return (
    <div>
      <div className="game__buttons">
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
    <div className="game__price">
      <span>Current {currentPrice.value.name} Price:</span>
      <span>{formattedPrice}</span>
    </div>
  );
};

const GameOverScreen = ({ onActionClick }: GameOverScreenProps) => (
  <div>
    <h2>Game Over!</h2>
    <button onClick={onActionClick}>Restart</button>
  </div>
);

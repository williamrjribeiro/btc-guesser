import type { Signal } from '@preact/signals';
import GameCore, { GuessDirection, type CryptoPrice as CryptoPriceType } from '../../game-core/GameCore';
import type { GameScreenProps } from '../app';

const userLocale = navigator.language || 'en-US';
const priceFormatter = new Intl.NumberFormat(userLocale, {
  style: 'currency',
  currency: 'USD',
});

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

const CryptoPrice = ({ currentPrice }: { currentPrice: Signal<CryptoPriceType | null> }) => {
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

export const GameLoopScreen = ({ gameCore }: GameScreenProps) => (
  <div className="game">
    <CryptoPrice currentPrice={gameCore.currentPrice} />
    <GuessInput gameCore={gameCore} />
    <button className="game__quit" onClick={() => gameCore.stop()}>
      Quit
    </button>
  </div>
);

import type { Signal } from '@preact/signals';
import { useSignal, useComputed, useSignalEffect } from '@preact/signals';
import GameCore, {
  GuessDirection,
  type CryptoPrice as CryptoPriceType,
  type CryptoPriceGuess,
} from '../../game-core/GameCore';
import type { GameScreenProps } from '../app';
import { Table, TableContainer, TableHead, TableRow, TableHeader, TableCell } from './Table';
import { Button } from './Button';

export const GameLoopScreen = ({ gameCore }: GameScreenProps) => (
  <div className="game-loop">
    <div className="game-loop__top-section">
      <ScoreDisplay gameCore={gameCore} />
      <CryptoPrice currentPrice={gameCore.currentPrice} />
      <CountdownTimer gameCore={gameCore} />
      <GuessInput gameCore={gameCore} />
    </div>
    <PriceGuessHistory priceHistory={gameCore.priceHistory} />
    <Button variant="danger" onClick={() => gameCore.stop()}>
      Quit
    </Button>
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

const ScoreDisplay = ({ gameCore }: { gameCore: GameCore }) => (
  <div className="game-loop__score">
    <span>💰 Score:</span>
    <span>{gameCore.score.value}</span>
  </div>
);

const userLocale = navigator.language || 'en-US';
const priceFormatter = new Intl.NumberFormat(userLocale, {
  style: 'currency',
  currency: 'USD',
});

const CryptoPrice = ({ currentPrice }: { currentPrice: Signal<CryptoPriceType | null> }) => {
  if (!currentPrice.value) {
    return <div>Loading price...</div>;
  }

  const formattedPrice = priceFormatter.format(currentPrice.value.ammount);

  return (
    <div className="game-loop__price">
      <span>Current {currentPrice.value.name} Price:</span>
      <span>{formattedPrice}</span>
    </div>
  );
};

const GuessInput = ({ gameCore }: { gameCore: GameCore }) => {
  if (gameCore.hasGuessed.value) {
    return (
      <div className="game-loop__buttons">
        <GuessButton direction={gameCore.currentGuess.value!} disabled={true} />
      </div>
    );
  }
  const disableGuess = !gameCore.canGuess.value;

  return (
    <div className="game-loop__buttons">
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
  );
};

const PriceGuessHistory = ({ priceHistory }: { priceHistory: Signal<CryptoPriceGuess[]> }) => (
  <div className="game-loop__price-history">
    <TableContainer scrollable>
      <Table compact>
        <TableHead sticky>
          <TableHeader compact>Movement</TableHeader>
          <TableHeader compact>Result</TableHeader>
          <TableHeader compact>Price</TableHeader>
          <TableHeader compact>Time</TableHeader>
        </TableHead>
        <tbody>
          {priceHistory.value.map((price) => (
            <TableRow key={price.price.timestamp}>
              <TableCell compact>
                {price.direction === GuessDirection.Up ? '⬆️' : price.direction === GuessDirection.Down ? '⬇️' : '-'}
              </TableCell>
              <TableCell compact>
                {price.isCorrect === undefined ? '🐔' : price.isCorrect ? '✅' : '❌'}
              </TableCell>
              <TableCell compact>{priceFormatter.format(price.price.ammount)}</TableCell>
              <TableCell compact>{new Date(price.price.timestamp).toLocaleTimeString()}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  </div>
);

const CountdownTimer = ({ gameCore }: { gameCore: GameCore }) => {
  const countdown = useSignal(gameCore.config.poolInterval / 1000);
  const lastTimestamp = useSignal(0);

  const displayValue = useComputed(() => {
    if (gameCore.state.value === 'blocked') return '-';
    return countdown.value.toFixed(1);
  });

  useSignalEffect(() => {
    // Reset countdown when price updates
    const currentTimestamp = gameCore.currentPrice.value?.timestamp || 0;
    if (currentTimestamp !== lastTimestamp.value) {
      lastTimestamp.value = currentTimestamp;
      countdown.value = gameCore.config.poolInterval / 1000;
    }

    // Only run countdown when game is running
    if (gameCore.state.value !== 'running') return;

    const interval = setInterval(() => {
      if (countdown.value <= 0) {
        clearInterval(interval);
      } else {
        countdown.value = Number((countdown.value - 0.1).toFixed(1));
      }
    }, 100);

    return () => clearInterval(interval);
  });

  return (
    <div className="game-loop__countdown">
      <span>Next price: {displayValue}s</span>
    </div>
  );
};

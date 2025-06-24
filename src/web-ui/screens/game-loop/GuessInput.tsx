import GameCore, { GuessDirection } from '../../../game-core/GameCore';
import './guess-input.css';

const GuessInput = ({ gameCore }: { gameCore: GameCore }) => {
  if (gameCore.hasGuessed.value) {
    return (
      <div className="guess-input">
        <GuessButton direction={gameCore.currentGuess.value!} disabled={true} />
      </div>
    );
  }
  const disableGuess = !gameCore.canGuess.value;

  return (
    <div className="guess-input">
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
    className={`guess-input__button guess-input__button--${direction === GuessDirection.Up ? 'up' : 'down'}`}
    disabled={disabled}
    onClick={() => onClick?.(direction)}
  >
    {direction == GuessDirection.Up ? 'Goes up ⬆️' : 'Goes down ⬇️'}
  </button>
);

export default GuessInput;

import type { GameScreenProps } from '../app';
import type { CryptoPriceGuess } from '../../game-core/GameCore';

export const GameOverScreen = ({ gameCore }: GameScreenProps) => {
  const score = gameCore.score.value;
  const isPositive = score >= 0;
  
  return (
    <div className="game-over">
      <h2 className="game-over__title">Game Over</h2>
      <div className={`game-over__score ${isPositive ? 'game-over__score--positive' : 'game-over__score--negative'}`}>
        <span>Final Score: {score}</span>
        <span>{isPositive ? '🤑' : '💸'}</span>
      </div>
      <PriceGuessHistoryBreakdown priceHistory={gameCore.priceHistory.value} />
      <button className="game-over__restart" onClick={() => gameCore.restart()}>Play Again</button>
    </div>
  );
};


const PriceGuessHistoryBreakdown = ({ priceHistory }: { priceHistory: ReadonlyArray<CryptoPriceGuess> }) => {
  const stats = priceHistory.reduce(
    (acc, guess) => {
      if (guess.isCorrect === true) {
        acc.correct += 1;
      } else if (guess.isCorrect === false) {
        acc.incorrect += 1;
      } else if (guess.isCorrect === undefined && guess.direction !== null) {
        acc.noGuess += 1;
      }
      return acc;
    },
    { correct: 0, incorrect: 0, noGuess: 0 }
  );

  return (
    <div className="game-over__breakdown">
      <h3>Your Guessing Performance</h3>
      <div className="game-over__stats">
        <div className="game-over__stat">
          <span>✅ Correct:</span>
          <span>{stats.correct}</span>
        </div>
        <div className="game-over__stat">
          <span>❌ Incorrect:</span>
          <span>{stats.incorrect}</span>
        </div>
        <div className="game-over__stat">
          <span>🐔 No Guess:</span>
          <span>{stats.noGuess}</span>
        </div>
      </div>
    </div>
  );
};

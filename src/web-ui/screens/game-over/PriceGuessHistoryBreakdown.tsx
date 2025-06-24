import type { CryptoPriceGuess } from '../../../game-core/GameCore';
import HighscoreForm from './HighscoreForm';
import './breakdown.css';

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
    { correct: 0, incorrect: 0, noGuess: 0 },
  );

  return (
    <div className="breakdown">
      <h3 className="breakdown__title">Your Performance</h3>
      <div className="breakdown__stats">
        <div className="breakdown__stat breakdown__stat--correct">
          <span>✅ Correct:</span>
          <span>{stats.correct}</span>
        </div>
        <div className="breakdown__stat breakdown__stat--incorrect">
          <span>❌ Incorrect:</span>
          <span>{stats.incorrect}</span>
        </div>
        <div className="breakdown__stat breakdown__stat--no-guess">
          <span>🐔 No Guess:</span>
          <span>{stats.noGuess}</span>
        </div>
      </div>
      <HighscoreForm priceHistory={priceHistory} />
    </div>
  );
};

export default PriceGuessHistoryBreakdown;

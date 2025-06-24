import type { GameScreenProps } from '../../App';
import { CtaButton } from '../../components/CtaButton';
import { Screen } from '../../components/Screen';
import './score.css';
import HighScoresTable from './HighScoresTable';
import PriceGuessHistoryBreakdown from './PriceGuessHistoryBreakdown';
import './game-over.css';

export const GameOverScreen = ({ gameCore }: GameScreenProps) => {
  const score = gameCore.score.value;
  const isPositive = score >= 0;

  return (
    <Screen>
      <div className="game-over">
        <div className={`score score--game-over ${isPositive ? 'score--positive' : 'score--negative'}`}>
          <span>Final Score: {score}</span>
          <span>{isPositive ? '🤑' : '💸'}</span>
        </div>
        <div className="game-over__content">
          <PriceGuessHistoryBreakdown priceHistory={gameCore.priceHistory.value} />
          <HighScoresTable />
        </div>
        <CtaButton variant="primary" className="game-over__restart" onClick={() => gameCore.restart()}>
          Play Again
        </CtaButton>
      </div>
    </Screen>
  );
};

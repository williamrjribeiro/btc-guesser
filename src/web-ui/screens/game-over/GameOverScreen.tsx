import type { GameScreenProps } from '../../App';
import { CtaButton } from '../../components/CtaButton';
import { Screen } from '../../components/Screen';
import { FinalScore } from './FinalScore';
import HighScoresTable from './HighScoresTable';
import PriceGuessHistoryBreakdown from './PriceGuessHistoryBreakdown';
import './game-over.css';

export const GameOverScreen = ({ gameCore }: GameScreenProps) => (
  <Screen>
    <div className="game-over">
      <FinalScore score={gameCore.score.value} />
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

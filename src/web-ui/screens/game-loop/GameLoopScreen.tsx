import GameCore from '../../../game-core/GameCore';
import type { GameScreenProps } from '../../App';
import { CtaButton } from '../../components/CtaButton';
import { Screen } from '../../components/Screen';
import './score.css';
import GuessInput from './GuessInput';
import PriceGuessHistory from './PriceGuessHistory';
import CountdownTimer from './CountdownTimer';
import CryptoPrice from './CryptoPrice';
import './game-loop.css';

export const GameLoopScreen = ({ gameCore }: GameScreenProps) => (
  <Screen>
    <div className="game-loop">
      <div className="game-loop__top-section">
        <ScoreDisplay gameCore={gameCore} />
        <CryptoPrice currentPrice={gameCore.currentPrice} />
        <CountdownTimer gameCore={gameCore} />
        <GuessInput gameCore={gameCore} />
      </div>
      <PriceGuessHistory priceHistory={gameCore.priceHistory} />
      <CtaButton variant="danger" onClick={() => gameCore.stop()}>
        Quit
      </CtaButton>
    </div>
  </Screen>
);

const ScoreDisplay = ({ gameCore }: { gameCore: GameCore }) => (
  <div className="score score--game-loop">
    <span>💰 Score:</span>
    <span>{gameCore.score.value}</span>
  </div>
);

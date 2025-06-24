import GameCore from '../../../game-core/GameCore';
import './current-score.css';

interface CurrentScoreProps {
  gameCore: GameCore;
}

export const CurrentScore = ({ gameCore }: CurrentScoreProps) => (
  <div className="current-score">
    <span>💰 Score:</span>
    <span>{gameCore.score.value}</span>
  </div>
);

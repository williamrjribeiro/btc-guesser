import type { GameScreenProps } from '../app';

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
      <button className="game-over__restart" onClick={() => gameCore.restart()}>Play Again</button>
    </div>
  );
};

import type { GameScreenProps } from '../app';

export const GameStartScreen = ({ gameCore }: GameScreenProps) => (
  <div className="game-start">
    <div className="game-start__rules">
      <div className="game-start__rules-item">🎯 Guess if Bitcoin's price will go up or down in 1 minute</div>
      <div className="game-start__rules-item">💰 Score +1 for correct guesses, -1 for wrong ones</div>
      <div className="game-start__rules-item">⏳ One guess at a time - patience is a virtue!</div>
      <div className="game-start__rules-item">💾 Your score is saved - come back anytime!</div>
    </div>
    <button className="game-start__play" onClick={() => gameCore.start()}>
      🤞 Let's Play! 🤞
    </button>
  </div>
);

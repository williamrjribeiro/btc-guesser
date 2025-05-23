import type { GameScreenProps } from '../app';

export const GameStartScreen = ({ gameCore }: GameScreenProps) => (
  <div className="game-start">
    <div className="game-start__rules">
      <div className="game-start__rules-item">🎯 Guess if Bitcoin's price will go up or down in 1 minute</div>
      <div className="game-start__rules-item">💰 Score +1 for correct guesses, -1 for wrong ones</div>
      <div className="game-start__rules-item">⏳ One guess at a time - patience is a virtue!</div>
      <div className="game-start__rules-item">💾 Your score is saved - come back anytime!</div>
    </div>
    <div className="game-start__buttons">
      <button className="cta cta--primary" onClick={() => gameCore.start(true)}>
        🤞 New Game 🤞
      </button>
      {gameCore.priceHistory.value.length > 0 && (
        <button className="cta cta--secondary" onClick={() => gameCore.start()}>
          🎮 Continue 🎮
        </button>
      )}
    </div>
  </div>
);

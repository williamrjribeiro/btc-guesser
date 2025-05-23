import type { GameScreenProps } from '../app';
import { Button } from './Button';

export const GameStartScreen = ({ gameCore }: GameScreenProps) => (
  <div className="game-start">
    <div className="game-start__rules">
      <div className="game-start__rules-item">🎯 Guess if Bitcoin's price will go up or down in 1 minute</div>
      <div className="game-start__rules-item">💰 Score +1 for correct guesses, -1 for wrong ones</div>
      <div className="game-start__rules-item">⏳ One guess at a time - patience is a virtue!</div>
      <div className="game-start__rules-item">💾 Your score is saved - come back anytime!</div>
    </div>
    <div className="game-start__buttons">
      <Button variant="primary" onClick={() => gameCore.start(true)}>
        🤞 New Game 🤞
      </Button>
      {gameCore.priceHistory.value.length > 0 && (
        <Button variant="secondary" onClick={() => gameCore.start()}>
          🎮 Continue 🎮
        </Button>
      )}
    </div>
  </div>
);

import type { GameScreenProps } from '../app';
import { CtaButton } from './CtaButton';
import './rules.css';

export const GameStartScreen = ({ gameCore }: GameScreenProps) => (
  <div className="game-start">
    <div className="rules">
      <div className="rules__item">🎯 Guess if Bitcoin's price will go up or down in 1 minute</div>
      <div className="rules__item">💰 Score +1 for correct guesses, -1 for wrong ones</div>
      <div className="rules__item">⏳ One guess at a time - patience is a virtue!</div>
      <div className="rules__item">💾 Your score is saved - come back anytime!</div>
    </div>
    <div className="game-start__buttons">
      <CtaButton variant="primary" onClick={() => gameCore.start(true)}>
        🤞 New Game 🤞
      </CtaButton>
      {gameCore.priceHistory.value.length > 0 && (
        <CtaButton variant="secondary" onClick={() => gameCore.start()}>
          🎮 Continue 🎮
        </CtaButton>
      )}
    </div>
  </div>
);

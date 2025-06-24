import './final-score.css';

interface FinalScoreProps {
  score: number;
}

export const FinalScore = ({ score }: FinalScoreProps) => {
  const scoreResult = score === 0 ? 'zero' : score > 0 ? 'positive' : 'negative';
  const { emoji, className } = SCORE_RESULTS_MAP[scoreResult];
  
  return (
    <div className={`final-score ${className}`}>
      <span>Final Score: {score}</span>
      <span>{emoji}</span>
    </div>
  );
};

const SCORE_RESULTS_MAP = {
  positive: {
    emoji: '🤑',
    className: 'final-score--positive',
  },
  zero: {
    emoji: '🐔',
    className: 'final-score--zero',
  },
  negative: {
    emoji: '💸',
    className: 'final-score--negative',
  },
};
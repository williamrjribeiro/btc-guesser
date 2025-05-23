import { useSignal, useSignalEffect } from '@preact/signals';
import type { GameScreenProps } from '../app';
import type { CryptoPriceGuess } from '../../game-core/GameCore';
import { getHighScore as getHighScoreReal, saveHighScore } from '../../adapters/RealHighScoreAPI';
import type { HighScore } from '../../game-core/HighScoreAPI';
import { Table, TableContainer, TableHead, TableRow, TableHeader, TableCell } from './Table';
import { Button } from './Button';
import './score.css';
import './breakdown.css';
import './highscore-form.css';

export const GameOverScreen = ({ gameCore }: GameScreenProps) => {
  const score = gameCore.score.value;
  const isPositive = score >= 0;

  return (
    <div className="game-over">
      <h2 className="game-over__title">Game Over</h2>
      <div className={`score score--game-over ${isPositive ? 'score--positive' : 'score--negative'}`}>
        <span>Final Score: {score}</span>
        <span>{isPositive ? '🤑' : '💸'}</span>
      </div>
      <div className="game-over__content">
        <PriceGuessHistoryBreakdown priceHistory={gameCore.priceHistory.value} />
        <HighScoresTable />
      </div>
      <Button variant="primary" className="game-over__restart" onClick={() => gameCore.restart()}>
        Play Again
      </Button>
    </div>
  );
};

const PriceGuessHistoryBreakdown = ({ priceHistory }: { priceHistory: ReadonlyArray<CryptoPriceGuess> }) => {
  const stats = priceHistory.reduce(
    (acc, guess) => {
      if (guess.isCorrect === true) {
        acc.correct += 1;
      } else if (guess.isCorrect === false) {
        acc.incorrect += 1;
      } else if (guess.isCorrect === undefined && guess.direction !== null) {
        acc.noGuess += 1;
      }
      return acc;
    },
    { correct: 0, incorrect: 0, noGuess: 0 },
  );

  return (
    <div className="breakdown">
      <h3 className="breakdown__title">Your Performance</h3>
      <div className="breakdown__stats">
        <div className="breakdown__stat breakdown__stat--correct">
          <span>✅ Correct:</span>
          <span>{stats.correct}</span>
        </div>
        <div className="breakdown__stat breakdown__stat--incorrect">
          <span>❌ Incorrect:</span>
          <span>{stats.incorrect}</span>
        </div>
        <div className="breakdown__stat breakdown__stat--no-guess">
          <span>🐔 No Guess:</span>
          <span>{stats.noGuess}</span>
        </div>
      </div>
      <HighscoreForm priceHistory={priceHistory} />
    </div>
  );
};

const HighscoreForm = ({ priceHistory }: { priceHistory: ReadonlyArray<CryptoPriceGuess> }) => {
  const username = useSignal('');
  const isSubmitting = useSignal(false);
  const hasSubmitted = useSignal(false);
  const submittedUsername = useSignal('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (username.value.trim().length === 0) return;

    try {
      isSubmitting.value = true;
      await saveHighScore([...priceHistory], username.value.trim());
      submittedUsername.value = username.value.trim();
      hasSubmitted.value = true;
      username.value = '';
    } catch (error) {
      console.error('Failed to submit high score:', error);
    } finally {
      isSubmitting.value = false;
    }
  };

  if (hasSubmitted.value) {
    return (
      <div className="highscore-form__success">
        Nice one, <strong>{submittedUsername.value}</strong>!<br/>
        Try not to lose it all next time 😏
      </div>
    );
  }

  return (
    <form className="highscore-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="highscore-form__input"
        placeholder="Enter your name"
        maxLength={4}
        value={username.value}
        onInput={(e) => (username.value = (e.target as HTMLInputElement).value)}
        disabled={isSubmitting.value}
      />
      <button
        type="submit"
        className="highscore-form__submit"
        disabled={isSubmitting.value || username.value.trim().length === 0}
      >
        {isSubmitting.value ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

const HighScoresTable = () => {
  const highScores = useSignal<HighScore[]>([]);
  const isLoading = useSignal(true);

  useSignalEffect(() => {
    const fetchHighScores = async () => {
      try {
        isLoading.value = true;
        // const scores = await getHighScore();
        const scores = await getHighScoreReal();
        console.log('[HighScoresTable] scores', scores);
        // console.log('scoresReal', scoresReal);
        highScores.value = scores;
      } catch (error) {
        console.error('Failed to fetch high scores:', error);
      } finally {
        isLoading.value = false;
      }
    };

    fetchHighScores();
  });

  return (
    <div className="game-over__high-scores">
      <h3>High Scores</h3>
      {isLoading.value ? (
        <div className="game-over__high-scores__loading">Loading high scores...</div>
      ) : (
        <TableContainer elevated>
          <Table elevated>
            <TableHead dark sticky>
              <TableHeader styled>Rank</TableHeader>
              <TableHeader styled>Player</TableHeader>
              <TableHeader styled>Score</TableHeader>
              <TableHeader styled>✅</TableHeader>
              <TableHeader styled>❌</TableHeader>
              <TableHeader styled>🐔</TableHeader>
              <TableHeader styled>Date</TableHeader>
            </TableHead>
            <tbody>
              {highScores.value.map((highScore: HighScore, index: number) => (
                <HighScoreRow key={highScore.id || index} highScore={highScore} rank={index + 1} />
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

const HighScoreRow = ({ highScore, rank }: { highScore: HighScore; rank: number }) => {
  const stats = parseSerializedHistory(highScore.serializedHistory);

  return (
    <TableRow>
      <TableCell>{rank}</TableCell>
      <TableCell>{highScore.username}</TableCell>
      <TableCell scorePositive={highScore.score >= 0} scoreNegative={highScore.score < 0}>
        {highScore.score}
      </TableCell>
      <TableCell>{stats.correct}</TableCell>
      <TableCell>{stats.wrong}</TableCell>
      <TableCell>{stats.noGuess}</TableCell>
      <TableCell>{new Date(highScore.date).toLocaleDateString()}</TableCell>
    </TableRow>
  );
};

const parseSerializedHistory = (serialized: string): { correct: number; wrong: number; noGuess: number } => {
  const [correct, wrong, noGuess] = serialized.split(',');
  return {
    correct: parseInt(correct.slice(1)),
    wrong: parseInt(wrong.slice(1)),
    noGuess: parseInt(noGuess.slice(1)),
  };
};

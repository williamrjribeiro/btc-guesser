import { useSignal, useSignalEffect } from '@preact/signals';
import type { GameScreenProps } from '../app';
import type { CryptoPriceGuess } from '../../game-core/GameCore';
import { getHighScore } from '../../adapters/MockHighScoreAPI';
import type { HighScore } from '../../game-core/HighScoreAPI';
import { Table, TableContainer, TableHead, TableRow, TableHeader, TableCell } from './Table';

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
      <div className="game-over__content">
        <PriceGuessHistoryBreakdown priceHistory={gameCore.priceHistory.value} />
        <HighScoresTable />
      </div>
      <button className="cta cta--primary game-over__restart" onClick={() => gameCore.restart()}>
        Play Again
      </button>
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
    <div className="game-over__breakdown">
      <h3>Your Performance</h3>
      <div className="game-over__stats">
        <div className="game-over__stat game-over__stat--correct">
          <span>✅ Correct:</span>
          <span>{stats.correct}</span>
        </div>
        <div className="game-over__stat game-over__stat--incorrect">
          <span>❌ Incorrect:</span>
          <span>{stats.incorrect}</span>
        </div>
        <div className="game-over__stat game-over__stat--no-guess">
          <span>🐔 No Guess:</span>
          <span>{stats.noGuess}</span>
        </div>
      </div>
    </div>
  );
};

const HighScoresTable = () => {
  const highScores = useSignal<HighScore[]>([]);
  const isLoading = useSignal(true);

  useSignalEffect(() => {
    const fetchHighScores = async () => {
      try {
        isLoading.value = true;
        const scores = await getHighScore();
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
        <div className="game-over__high-scores__loading">
          Loading high scores...
        </div>
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
                <HighScoreRow 
                  key={highScore.id || index}
                  highScore={highScore} 
                  rank={index + 1} 
                />
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
      <TableCell 
        scorePositive={highScore.score >= 0} 
        scoreNegative={highScore.score < 0}
      >
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
    noGuess: parseInt(noGuess.slice(1))
  };
};

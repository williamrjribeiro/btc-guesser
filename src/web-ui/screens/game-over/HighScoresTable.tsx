import { useSignal, useSignalEffect } from '@preact/signals';

import { Table, TableContainer, TableHead, TableRow, TableHeader, TableCell } from '../../components/Table';
import type { HighScore } from '../../../game-core/HighScoreAPI';
import { getHighScore as getHighScoreReal } from '../../../adapters/RealHighScoreAPI';

const HighScoresTable = () => {
  const highScores = useSignal<HighScore[]>([]);
  const isLoading = useSignal(true);

  useSignalEffect(() => {
    const fetchHighScores = async () => {
      try {
        isLoading.value = true;
        const scores = await getHighScoreReal();
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

export default HighScoresTable;

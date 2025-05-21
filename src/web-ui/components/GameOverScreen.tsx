import type { GameScreenProps } from '../app';

export const GameOverScreen = ({ gameCore }: GameScreenProps) => (
  <div>
    <h2>Game Over!</h2>
    <button onClick={() => gameCore.restart()}>Restart</button>
  </div>
);

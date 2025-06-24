import { useSignal, useComputed, useSignalEffect } from '@preact/signals';
import GameCore from '../../../game-core/GameCore';
import './countdown.css';

const CountdownTimer = ({ gameCore }: { gameCore: GameCore }) => {
  const countdown = useSignal(gameCore.config.poolInterval / 1000);
  const lastTimestamp = useSignal(0);

  const displayValue = useComputed(() => {
    if (gameCore.state.value === 'blocked') return '-';
    return countdown.value.toFixed(1);
  });

  useSignalEffect(() => {
    // Reset countdown when price updates
    const currentTimestamp = gameCore.currentPrice.value?.timestamp || 0;
    if (currentTimestamp !== lastTimestamp.value) {
      lastTimestamp.value = currentTimestamp;
      countdown.value = gameCore.config.poolInterval / 1000;
    }

    // Only run countdown when game is running
    if (gameCore.state.value !== 'running') return;

    const interval = setInterval(() => {
      if (countdown.value <= 0) {
        clearInterval(interval);
      } else {
        countdown.value = Number((countdown.value - 0.1).toFixed(1));
      }
    }, 100);

    return () => clearInterval(interval);
  });

  return (
    <div className="countdown">
      <span>Next price: {displayValue}s</span>
    </div>
  );
};

export default CountdownTimer;

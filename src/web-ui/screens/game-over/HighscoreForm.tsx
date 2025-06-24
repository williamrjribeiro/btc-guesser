import { useSignal } from '@preact/signals';
import type { CryptoPriceGuess } from '../../../game-core/GameCore';
import { saveHighScore } from '../../../adapters/RealHighScoreAPI';
import './highscore-form.css';

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
        Nice one, <strong>{submittedUsername.value}</strong>!<br />
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

export default HighscoreForm;

import priceFormatter from './priceFormatter';
import type { Signal } from '@preact/signals';
import { type CryptoPrice as CryptoPriceType } from '../../../game-core/GameCore';
import './price.css';

const CryptoPrice = ({ currentPrice }: { currentPrice: Signal<CryptoPriceType | null> }) => {
  if (!currentPrice.value) {
    return <div>Loading price...</div>;
  }

  const formattedPrice = priceFormatter.format(currentPrice.value.ammount);

  return (
    <div className="price">
      <span>Current {currentPrice.value.name} Price:</span>
      <span>{formattedPrice}</span>
    </div>
  );
};

export default CryptoPrice;

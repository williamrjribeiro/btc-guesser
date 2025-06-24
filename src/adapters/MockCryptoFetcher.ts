import type { CryptoPriceFetcher } from '../game-core/GameCore';

export const mockCryptoPriceFetcher: CryptoPriceFetcher = async (cryptoName: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: cryptoName,
        ammount: Math.random() * 15000 + 90000,
        timestamp: Date.now(),
      });
    }, 200); // fake network delay
  });
};

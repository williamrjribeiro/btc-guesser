import type { CryptoPriceFetcher } from '../game-core/GameCore';

export const mockCryptoPriceFetcher: CryptoPriceFetcher = async (cryptoName: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                name: cryptoName,
                price: Math.random() * 10000,
                timestamp: Date.now(),
            });
        }, 200); // fake network delay
    });
};
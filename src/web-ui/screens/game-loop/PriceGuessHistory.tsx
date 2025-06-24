import type { Signal } from '@preact/signals';
import { Table, TableContainer, TableHead, TableRow, TableHeader, TableCell } from '../../components/Table';
import priceFormatter from './priceFormatter';
import { GuessDirection, type CryptoPriceGuess } from '../../../game-core/GameCore';
import './price-history.css';

const PriceGuessHistory = ({ priceHistory }: { priceHistory: Signal<CryptoPriceGuess[]> }) => (
  <div className="price-history">
    <TableContainer scrollable>
      <Table compact>
        <TableHead sticky>
          <TableHeader compact>Movement</TableHeader>
          <TableHeader compact>Result</TableHeader>
          <TableHeader compact>Price</TableHeader>
          <TableHeader compact>Time</TableHeader>
        </TableHead>
        <tbody>
          {priceHistory.value.map((price) => (
            <TableRow key={price.price.timestamp}>
              <TableCell compact>
                {price.direction === GuessDirection.Up ? '⬆️' : price.direction === GuessDirection.Down ? '⬇️' : '-'}
              </TableCell>
              <TableCell compact>{price.isCorrect === undefined ? '🐔' : price.isCorrect ? '✅' : '❌'}</TableCell>
              <TableCell compact>{priceFormatter.format(price.price.ammount)}</TableCell>
              <TableCell compact>{new Date(price.price.timestamp).toLocaleTimeString()}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  </div>
);

export default PriceGuessHistory;

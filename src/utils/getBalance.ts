import { type } from 'os';
import { IStatement } from '../routes/account/types';

export function getBalance(statement: IStatement[]) {
  const totalAmount = statement.reduce((acumulator: number, item: IStatement) => {
    if (item.type === 'credit') {
      return acumulator += item.amount;
    } else {
      return acumulator -= item.amount;
    }
  }, 0);

  return totalAmount;
};
import { RefundDenomination } from '../types';

export const INDIAN_CURRENCY_DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

export interface CoinChangeStep {
  stepNumber: number;
  denomination: number;
  notesUsed: number;
  subtotal: number;
  remainingAmount: number;
  explanation: string;
}

export interface CoinChangeResult {
  originalAmount: number;
  totalNotesOrCoins: number;
  denominations: RefundDenomination[];
  steps: CoinChangeStep[];
}

/**
 * Greedy Coin Change Algorithm for Railway Ticket Refund:
 * Given a cancellation refund amount in INR, greedily dispenses the largest
 * possible banknote/coin denomination at each step to minimize total currency count.
 */
export function calculateGreedyRefundDenominations(amount: number): CoinChangeResult {
  const steps: CoinChangeStep[] = [];
  let remaining = Math.max(0, Math.round(amount));
  const denominations: RefundDenomination[] = [];
  let totalCount = 0;

  for (const denom of INDIAN_CURRENCY_DENOMINATIONS) {
    if (remaining >= denom) {
      const count = Math.floor(remaining / denom);
      const subtotal = count * denom;
      remaining = remaining % denom;
      totalCount += count;

      denominations.push({
        denomination: denom,
        count,
        totalValue: subtotal,
      });

      steps.push({
        stepNumber: steps.length + 1,
        denomination: denom,
        notesUsed: count,
        subtotal,
        remainingAmount: remaining,
        explanation: `Greedily selected ${count} × ₹${denom} banknote(s) totaling ₹${subtotal}. Remaining refund balance to dispense: ₹${remaining}.`,
      });
    }

    if (remaining === 0) break;
  }

  return {
    originalAmount: Math.round(amount),
    totalNotesOrCoins: totalCount,
    denominations,
    steps,
  };
}

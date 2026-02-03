// Withdrawal module constants

import { WithdrawalStatus } from '@prisma/client';

/**
 * Minimum withdrawal amount in centavos (R$ 10,00)
 */
export const MIN_WITHDRAWAL_CENTS = 1000;

/**
 * Maximum withdrawal amount in centavos (R$ 100.000,00)
 */
export const MAX_WITHDRAWAL_CENTS = 10000000;

/**
 * Valid state transitions for withdrawals
 */
export const WITHDRAWAL_STATE_TRANSITIONS: Record<WithdrawalStatus, WithdrawalStatus[]> = {
  REQUESTED: ['VALIDATING', 'CANCELLED'],
  VALIDATING: ['SCHEDULED', 'FAILED', 'CANCELLED'],
  SCHEDULED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PAID', 'FAILED'],
  PAID: [],
  FAILED: ['REQUESTED'], // Can retry
  CANCELLED: [],
};

/**
 * Check if a state transition is valid
 */
export function isValidWithdrawalTransition(
  from: WithdrawalStatus,
  to: WithdrawalStatus
): boolean {
  return WITHDRAWAL_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Withdrawal processing windows
 * Withdrawals requested before cutoff time are processed same day
 */
export const WITHDRAWAL_PROCESSING = {
  CUTOFF_HOUR: 14, // 14:00 BRT
  PROCESSING_DAYS: [1, 2, 3, 4, 5], // Monday to Friday
} as const;

/**
 * PSP provider for payouts
 */
export const PAYOUT_PROVIDER = 'PSP';

import {
  PaymentKind,
  PaymentMethod,
  PaymentIntentStatus,
  LedgerDirection,
  LedgerEntryType,
  ResourceType,
  HoldReason,
} from '@prisma/client';

export interface CreatePaymentIntentInput {
  kind: PaymentKind;
  method: PaymentMethod;
  amountCents: number;
  customerUserId: string;
  tenantId?: string;
  appointmentId?: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
}

export interface SplitCalculation {
  grossCents: number;
  gatewayFeeCents: number;
  canneoFeeCents: number;
  doctorNetCents: number;
  gatewayRateBps: number;
  gatewayFixedCents: number;
  canneoRateBps: number;
}

export interface LedgerEntryInput {
  tenantId?: string;
  walletId: string;
  direction: LedgerDirection;
  amountCents: number;
  entryType: LedgerEntryType;
  referenceType: ResourceType;
  referenceId: string;
  idempotencyKey?: string;
}

export interface CreateHoldInput {
  tenantId?: string;
  walletId: string;
  paymentIntentId?: string;
  amountCents: number;
  reason: HoldReason;
  releaseAt: Date;
}

export interface WalletBalanceUpdate {
  walletId: string;
  pendingDelta?: number;
  availableDelta?: number;
  onHoldDelta?: number;
  withdrawnDelta?: number;
}

export interface PaymentApprovalResult {
  paymentIntentId: string;
  ledgerEntries: string[];
  feeId: string;
  holdId: string;
  splitCalculation: SplitCalculation;
}

export interface RefundInput {
  paymentIntentId: string;
  amountCents: number;
  reason?: string;
}

export interface WithdrawalInput {
  doctorId: string;
  walletId: string;
  bankAccountId: string;
  amountCents: number;
}

import { PaymentMethod } from '@prisma/client';

export const PAYMENT_CONSTANTS = {
  // Taxas padrão (basis points = 1/100 de 1%)
  DEFAULT_GATEWAY_RATE_BPS: 249, // 2.49%
  DEFAULT_GATEWAY_FIXED_CENTS: 0,
  DEFAULT_CANNEO_RATE_BPS: 1000, // 10%

  // Taxas por método de pagamento
  GATEWAY_RATES: {
    PIX: { rateBps: 99, fixedCents: 0 }, // 0.99%
    CARD_CREDIT: { rateBps: 449, fixedCents: 0 }, // 4.49%
    CARD_DEBIT: { rateBps: 199, fixedCents: 0 }, // 1.99%
  } as Record<PaymentMethod, { rateBps: number; fixedCents: number }>,

  // Janelas antifraude (dias)
  ANTIFRAUD_WINDOWS: {
    PIX: 1, // D+1
    CARD_CREDIT: 7, // D+7
    CARD_DEBIT: 2, // D+2
  } as Record<PaymentMethod, number>,

  // Limites
  MIN_PAYMENT_CENTS: 100, // R$ 1,00
  MAX_PAYMENT_CENTS: 1000000000, // R$ 10.000.000,00

  // Expiração de PaymentIntent
  PAYMENT_INTENT_EXPIRY_MINUTES: 30,

  // Queue
  HOLD_RELEASE_QUEUE: 'hold-release',
  HOLD_RELEASE_CRON: '* * * * *', // A cada minuto
} as const;

export const WALLET_IDS = {
  PLATFORM: 'platform-wallet',
  GATEWAY: 'gateway-wallet',
} as const;

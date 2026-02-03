// CANNEO - Payment validation schemas (Zod)
import { z } from 'zod';

// ==================== PAYMENT ENUMS ====================

export const paymentKindSchema = z.enum(['CONSULT', 'ORDER', 'SUBSCRIPTION']);
export const paymentMethodSchema = z.enum(['PIX', 'CARD_CREDIT', 'CARD_DEBIT']);
export const paymentIntentStatusSchema = z.enum([
  'CREATED',
  'PENDING',
  'APPROVED',
  'FAILED',
  'EXPIRED',
  'REFUNDED',
  'CHARGEBACK',
]);

// ==================== PAYMENT INTENT SCHEMAS ====================

export const createPaymentIntentSchema = z.object({
  kind: paymentKindSchema,
  method: paymentMethodSchema,
  amountCents: z
    .number()
    .int('Valor deve ser inteiro (centavos)')
    .positive('Valor deve ser positivo')
    .max(100000000, 'Valor máximo excedido'), // max 1M BRL
  referenceType: z.enum(['APPOINTMENT', 'ORDER']),
  referenceId: z.string().cuid('ID de referência inválido'),
  metadata: z.record(z.unknown()).optional(),
});

export const processPaymentSchema = z.object({
  paymentIntentId: z.string().cuid('ID do pagamento inválido'),
  cardToken: z.string().optional(), // for card payments
  cardHolderName: z.string().max(100).optional(),
  cardLastFour: z.string().length(4).optional(),
  installments: z.number().int().min(1).max(12).optional(),
});

// ==================== WALLET SCHEMAS ====================

export const walletOwnerTypeSchema = z.enum(['PLATFORM', 'DOCTOR', 'PHARMACY', 'GATEWAY']);

// ==================== WITHDRAWAL SCHEMAS ====================

export const withdrawalStatusSchema = z.enum([
  'REQUESTED',
  'VALIDATING',
  'SCHEDULED',
  'PROCESSING',
  'PAID',
  'FAILED',
  'CANCELLED',
]);

export const createWithdrawalSchema = z.object({
  bankAccountId: z.string().cuid('ID da conta bancária inválido'),
  amountCents: z
    .number()
    .int('Valor deve ser inteiro (centavos)')
    .positive('Valor deve ser positivo')
    .min(1000, 'Valor mínimo para saque é R$ 10,00'), // min 10 BRL
});

// ==================== BANK ACCOUNT SCHEMAS ====================

export const createBankAccountSchema = z
  .object({
    bankCode: z
      .string()
      .length(3)
      .regex(/^\d+$/, 'Código do banco inválido')
      .optional(),
    branch: z
      .string()
      .min(4)
      .max(6)
      .regex(/^\d+$/, 'Agência inválida')
      .optional(),
    account: z
      .string()
      .min(5)
      .max(15)
      .regex(/^\d+$/, 'Conta inválida')
      .optional(),
    accountDigit: z
      .string()
      .max(2)
      .regex(/^[\dXx]$/, 'Dígito inválido')
      .optional(),
    pixKey: z.string().min(1).max(100).optional(),
  })
  .refine(
    (data) => {
      // Either PIX key or bank details must be provided
      const hasPix = !!data.pixKey;
      const hasBankDetails = !!data.bankCode && !!data.branch && !!data.account;
      return hasPix || hasBankDetails;
    },
    { message: 'Informe a chave PIX ou os dados bancários completos' }
  );

// ==================== REFUND SCHEMAS ====================

export const createRefundSchema = z.object({
  paymentIntentId: z.string().cuid('ID do pagamento inválido'),
  amountCents: z.number().int().positive().optional(), // partial refund
  reason: z.string().max(500).optional(),
});

// Type exports
export type CreatePaymentIntent = z.infer<typeof createPaymentIntentSchema>;
export type ProcessPayment = z.infer<typeof processPaymentSchema>;
export type CreateWithdrawal = z.infer<typeof createWithdrawalSchema>;
export type CreateBankAccount = z.infer<typeof createBankAccountSchema>;
export type CreateRefund = z.infer<typeof createRefundSchema>;

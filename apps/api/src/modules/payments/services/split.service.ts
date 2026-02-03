import { Injectable } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { PAYMENT_CONSTANTS } from '../constants/payment.constants';
import { SplitCalculation } from '../interfaces/payment.interface';

@Injectable()
export class SplitService {
  /**
   * Arredondamento half-up (bancário)
   * Math.round já faz half-up para números positivos
   */
  private roundHalfUp(value: number): number {
    return Math.round(value);
  }

  /**
   * Calcula o split de um pagamento
   *
   * Fórmula:
   * gateway_fee = round_half_up(gross * gateway_rate) + gateway_fixed
   * net_base = gross - gateway_fee
   * canneo_fee = round_half_up(net_base * canneo_rate)
   * doctor_net = net_base - canneo_fee
   *
   * IMPORTANTE: Todos os valores são em centavos (inteiros)
   */
  calculateSplit(
    grossCents: number,
    method: PaymentMethod,
    customRates?: {
      gatewayRateBps?: number;
      gatewayFixedCents?: number;
      canneoRateBps?: number;
    },
  ): SplitCalculation {
    // Validação
    if (!Number.isInteger(grossCents)) {
      throw new Error('grossCents must be an integer');
    }

    if (grossCents <= 0) {
      throw new Error('grossCents must be positive');
    }

    // Obter taxas (padrão ou customizadas)
    const defaultRates = PAYMENT_CONSTANTS.GATEWAY_RATES[method];

    const gatewayRateBps =
      customRates?.gatewayRateBps ?? defaultRates.rateBps;
    const gatewayFixedCents =
      customRates?.gatewayFixedCents ?? defaultRates.fixedCents;
    const canneoRateBps =
      customRates?.canneoRateBps ?? PAYMENT_CONSTANTS.DEFAULT_CANNEO_RATE_BPS;

    // Cálculo do gateway fee
    // rateBps está em basis points (1 bp = 0.01%)
    // gatewayFee = gross * (rateBps / 10000) + fixedCents
    const gatewayFeeVariable = this.roundHalfUp(
      (grossCents * gatewayRateBps) / 10000,
    );
    const gatewayFeeCents = gatewayFeeVariable + gatewayFixedCents;

    // Net base após gateway fee
    const netBaseCents = grossCents - gatewayFeeCents;

    // Cálculo do canneo fee (sobre o net base)
    const canneoFeeCents = this.roundHalfUp(
      (netBaseCents * canneoRateBps) / 10000,
    );

    // Net para o médico
    const doctorNetCents = netBaseCents - canneoFeeCents;

    // Validação: soma deve fechar
    const totalFees = gatewayFeeCents + canneoFeeCents + doctorNetCents;
    if (totalFees !== grossCents) {
      // Ajustar diferença de arredondamento no doctorNet (favorece o médico)
      const diff = grossCents - totalFees;
      return {
        grossCents,
        gatewayFeeCents,
        canneoFeeCents,
        doctorNetCents: doctorNetCents + diff,
        gatewayRateBps,
        gatewayFixedCents,
        canneoRateBps,
      };
    }

    return {
      grossCents,
      gatewayFeeCents,
      canneoFeeCents,
      doctorNetCents,
      gatewayRateBps,
      gatewayFixedCents,
      canneoRateBps,
    };
  }

  /**
   * Calcula a janela antifraude baseada no método de pagamento
   */
  calculateAntifraudWindow(method: PaymentMethod): Date {
    const days = PAYMENT_CONSTANTS.ANTIFRAUD_WINDOWS[method];
    const releaseAt = new Date();
    releaseAt.setDate(releaseAt.getDate() + days);
    releaseAt.setHours(0, 0, 0, 0); // Início do dia
    return releaseAt;
  }

  /**
   * Valida se um valor em centavos está dentro dos limites
   */
  validateAmount(amountCents: number): void {
    if (!Number.isInteger(amountCents)) {
      throw new Error('Amount must be an integer (cents)');
    }

    if (amountCents < PAYMENT_CONSTANTS.MIN_PAYMENT_CENTS) {
      throw new Error(
        `Minimum payment is ${PAYMENT_CONSTANTS.MIN_PAYMENT_CENTS} cents`,
      );
    }

    if (amountCents > PAYMENT_CONSTANTS.MAX_PAYMENT_CENTS) {
      throw new Error(
        `Maximum payment is ${PAYMENT_CONSTANTS.MAX_PAYMENT_CENTS} cents`,
      );
    }
  }
}

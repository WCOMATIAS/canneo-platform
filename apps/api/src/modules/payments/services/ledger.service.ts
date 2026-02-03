import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { LedgerDirection, LedgerEntryType, ResourceType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerEntryInput } from '../interfaces/payment.interface';

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma entrada no ledger
   *
   * REGRA CRÍTICA: Ledger é IMUTÁVEL
   * - NUNCA fazer update ou delete em LedgerEntry
   * - Estornos são feitos via contra-lançamento
   */
  async createEntry(input: LedgerEntryInput): Promise<string> {
    // Validação: valor deve ser positivo e inteiro
    if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
      throw new BadRequestException(
        'Amount must be a positive integer (cents)',
      );
    }

    const entry = await this.prisma.ledgerEntry.create({
      data: {
        tenantId: input.tenantId,
        walletId: input.walletId,
        direction: input.direction,
        amountCents: input.amountCents,
        entryType: input.entryType,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        idempotencyKey: input.idempotencyKey,
        currency: 'BRL',
      },
    });

    this.logger.log(
      `Ledger entry created: ${entry.id} | ${input.direction} ${input.amountCents} | ${input.entryType}`,
    );

    return entry.id;
  }

  /**
   * Cria múltiplas entradas em uma transação atômica
   */
  async createEntriesAtomic(entries: LedgerEntryInput[]): Promise<string[]> {
    const results = await this.prisma.$transaction(
      entries.map((entry) =>
        this.prisma.ledgerEntry.create({
          data: {
            tenantId: entry.tenantId,
            walletId: entry.walletId,
            direction: entry.direction,
            amountCents: entry.amountCents,
            entryType: entry.entryType,
            referenceType: entry.referenceType,
            referenceId: entry.referenceId,
            idempotencyKey: entry.idempotencyKey,
            currency: 'BRL',
          },
        }),
      ),
    );

    const ids = results.map((r) => r.id);
    this.logger.log(`Atomic ledger entries created: ${ids.join(', ')}`);
    return ids;
  }

  /**
   * Cria um contra-lançamento para estorno
   *
   * REGRA: Estornos são feitos via contra-lançamento, NUNCA deletando entradas
   */
  async createReversalEntry(
    originalEntryId: string,
    reason: string,
  ): Promise<string> {
    const original = await this.prisma.ledgerEntry.findUnique({
      where: { id: originalEntryId },
    });

    if (!original) {
      throw new BadRequestException('Original entry not found');
    }

    // Inverter a direção
    const reversalDirection =
      original.direction === LedgerDirection.CR
        ? LedgerDirection.DR
        : LedgerDirection.CR;

    const reversal = await this.prisma.ledgerEntry.create({
      data: {
        tenantId: original.tenantId,
        walletId: original.walletId,
        direction: reversalDirection,
        amountCents: original.amountCents,
        entryType: LedgerEntryType.REFUND,
        referenceType: original.referenceType,
        referenceId: original.referenceId,
        idempotencyKey: `reversal:${originalEntryId}:${Date.now()}`,
        currency: original.currency,
      },
    });

    this.logger.log(
      `Reversal entry created: ${reversal.id} for original ${originalEntryId} | Reason: ${reason}`,
    );

    return reversal.id;
  }

  /**
   * Obtém o histórico de entradas de uma wallet
   */
  async getWalletEntries(
    walletId: string,
    options?: {
      limit?: number;
      offset?: number;
      entryTypes?: LedgerEntryType[];
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    return this.prisma.ledgerEntry.findMany({
      where: {
        walletId,
        ...(options?.entryTypes && { entryType: { in: options.entryTypes } }),
        ...(options?.startDate && { createdAt: { gte: options.startDate } }),
        ...(options?.endDate && { createdAt: { lte: options.endDate } }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }

  /**
   * Obtém entradas por referência (ex: todas entradas de um PaymentIntent)
   */
  async getEntriesByReference(
    referenceType: ResourceType,
    referenceId: string,
  ) {
    return this.prisma.ledgerEntry.findMany({
      where: {
        referenceType,
        referenceId,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Calcula o saldo de uma wallet baseado no ledger
   * (para reconciliação - fonte da verdade é o ledger)
   */
  async calculateWalletBalance(walletId: string): Promise<number> {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: { walletId },
      select: { direction: true, amountCents: true },
    });

    return entries.reduce((balance, entry) => {
      if (entry.direction === LedgerDirection.CR) {
        return balance + entry.amountCents;
      } else {
        return balance - entry.amountCents;
      }
    }, 0);
  }
}

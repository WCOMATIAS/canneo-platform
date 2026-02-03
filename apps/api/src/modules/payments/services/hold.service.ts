import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HoldStatus, HoldReason, LedgerDirection, LedgerEntryType, ResourceType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from './wallet.service';
import { LedgerService } from './ledger.service';
import { CreateHoldInput } from '../interfaces/payment.interface';

@Injectable()
export class HoldService {
  private readonly logger = new Logger(HoldService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly ledgerService: LedgerService,
  ) {}

  /**
   * Cria um hold (bloqueio) em uma wallet
   */
  async createHold(input: CreateHoldInput): Promise<string> {
    const hold = await this.prisma.hold.create({
      data: {
        tenantId: input.tenantId,
        walletId: input.walletId,
        paymentIntentId: input.paymentIntentId,
        amountCents: input.amountCents,
        reason: input.reason,
        status: HoldStatus.ACTIVE,
        releaseAt: input.releaseAt,
      },
    });

    // Registrar no ledger
    await this.ledgerService.createEntry({
      tenantId: input.tenantId,
      walletId: input.walletId,
      direction: LedgerDirection.DR,
      amountCents: input.amountCents,
      entryType: LedgerEntryType.HOLD_APPLIED,
      referenceType: ResourceType.PAYMENT_INTENT,
      referenceId: input.paymentIntentId ?? hold.id,
      idempotencyKey: `hold:${hold.id}`,
    });

    this.logger.log(
      `Hold created: ${hold.id} | ${input.amountCents} cents | Release at: ${input.releaseAt}`,
    );

    return hold.id;
  }

  /**
   * Libera um hold específico
   */
  async releaseHold(holdId: string): Promise<void> {
    const hold = await this.prisma.hold.findUnique({
      where: { id: holdId },
    });

    if (!hold) {
      throw new NotFoundException(`Hold ${holdId} not found`);
    }

    if (hold.status !== HoldStatus.ACTIVE) {
      this.logger.warn(`Hold ${holdId} is not active, status: ${hold.status}`);
      return;
    }

    // Atualizar status do hold
    await this.prisma.hold.update({
      where: { id: holdId },
      data: {
        status: HoldStatus.RELEASED,
        releasedAt: new Date(),
      },
    });

    // Mover de pending para available na wallet
    await this.walletService.movePendingToAvailable(
      hold.walletId,
      hold.amountCents,
    );

    // Registrar no ledger
    await this.ledgerService.createEntry({
      tenantId: hold.tenantId ?? undefined,
      walletId: hold.walletId,
      direction: LedgerDirection.CR,
      amountCents: hold.amountCents,
      entryType: LedgerEntryType.HOLD_RELEASED,
      referenceType: ResourceType.PAYMENT_INTENT,
      referenceId: hold.paymentIntentId ?? hold.id,
      idempotencyKey: `release:${hold.id}`,
    });

    this.logger.log(`Hold released: ${holdId} | ${hold.amountCents} cents`);
  }

  /**
   * Cancela um hold (mantém o valor bloqueado, mas marca como cancelado)
   */
  async cancelHold(holdId: string, reason: string): Promise<void> {
    const hold = await this.prisma.hold.findUnique({
      where: { id: holdId },
    });

    if (!hold) {
      throw new NotFoundException(`Hold ${holdId} not found`);
    }

    if (hold.status !== HoldStatus.ACTIVE) {
      this.logger.warn(`Hold ${holdId} is not active, status: ${hold.status}`);
      return;
    }

    await this.prisma.hold.update({
      where: { id: holdId },
      data: {
        status: HoldStatus.CANCELLED,
        releasedAt: new Date(),
      },
    });

    this.logger.log(`Hold cancelled: ${holdId} | Reason: ${reason}`);
  }

  /**
   * Busca todos os holds que devem ser liberados
   */
  async getHoldsToRelease(): Promise<
    Array<{ id: string; walletId: string; amountCents: number }>
  > {
    const now = new Date();

    return this.prisma.hold.findMany({
      where: {
        status: HoldStatus.ACTIVE,
        releaseAt: { lte: now },
      },
      select: {
        id: true,
        walletId: true,
        amountCents: true,
      },
    });
  }

  /**
   * Processa liberação de todos os holds elegíveis
   */
  async processHoldReleases(): Promise<number> {
    const holdsToRelease = await this.getHoldsToRelease();

    this.logger.log(`Processing ${holdsToRelease.length} holds for release`);

    let releasedCount = 0;

    for (const hold of holdsToRelease) {
      try {
        await this.releaseHold(hold.id);
        releasedCount++;
      } catch (error) {
        this.logger.error(
          `Failed to release hold ${hold.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    this.logger.log(`Released ${releasedCount} of ${holdsToRelease.length} holds`);

    return releasedCount;
  }

  /**
   * Obtém holds ativos de uma wallet
   */
  async getActiveHolds(walletId: string) {
    return this.prisma.hold.findMany({
      where: {
        walletId,
        status: HoldStatus.ACTIVE,
      },
      orderBy: { releaseAt: 'asc' },
    });
  }

  /**
   * Cria um hold de chargeback
   */
  async createChargebackHold(
    walletId: string,
    paymentIntentId: string,
    amountCents: number,
    tenantId?: string,
  ): Promise<string> {
    // Hold de chargeback não tem data de liberação automática
    const releaseAt = new Date();
    releaseAt.setFullYear(releaseAt.getFullYear() + 10); // 10 anos no futuro

    return this.createHold({
      tenantId,
      walletId,
      paymentIntentId,
      amountCents,
      reason: HoldReason.CHARGEBACK,
      releaseAt,
    });
  }
}

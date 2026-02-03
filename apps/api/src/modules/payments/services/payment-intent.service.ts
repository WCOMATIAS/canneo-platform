import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  PaymentIntentStatus,
  PaymentMethod,
  LedgerDirection,
  LedgerEntryType,
  ResourceType,
  HoldReason,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SplitService } from './split.service';
import { LedgerService } from './ledger.service';
import { WalletService } from './wallet.service';
import { HoldService } from './hold.service';
import {
  CreatePaymentIntentInput,
  PaymentApprovalResult,
  RefundInput,
} from '../interfaces/payment.interface';
import { PAYMENT_CONSTANTS, WALLET_IDS } from '../constants/payment.constants';

@Injectable()
export class PaymentIntentService {
  private readonly logger = new Logger(PaymentIntentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly splitService: SplitService,
    private readonly ledgerService: LedgerService,
    private readonly walletService: WalletService,
    private readonly holdService: HoldService,
  ) {}

  /**
   * Cria um novo PaymentIntent
   */
  async create(input: CreatePaymentIntentInput): Promise<string> {
    // Validar valor
    this.splitService.validateAmount(input.amountCents);

    // Calcular expiração
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + PAYMENT_CONSTANTS.PAYMENT_INTENT_EXPIRY_MINUTES,
    );

    const paymentIntent = await this.prisma.paymentIntent.create({
      data: {
        tenantId: input.tenantId,
        kind: input.kind,
        method: input.method,
        status: PaymentIntentStatus.CREATED,
        amountCents: input.amountCents,
        currency: 'BRL',
        customerUserId: input.customerUserId,
        expiresAt,
        metadata: input.metadata as object,
      },
    });

    this.logger.log(
      `PaymentIntent created: ${paymentIntent.id} | ${input.amountCents} cents | ${input.method}`,
    );

    return paymentIntent.id;
  }

  /**
   * Obtém um PaymentIntent pelo ID
   */
  async getById(id: string) {
    const paymentIntent = await this.prisma.paymentIntent.findUnique({
      where: { id },
      include: {
        fees: true,
        holds: true,
        attempts: true,
      },
    });

    if (!paymentIntent) {
      throw new NotFoundException(`PaymentIntent ${id} not found`);
    }

    return paymentIntent;
  }

  /**
   * Atualiza o status de um PaymentIntent
   */
  async updateStatus(
    id: string,
    status: PaymentIntentStatus,
  ): Promise<void> {
    await this.prisma.paymentIntent.update({
      where: { id },
      data: { status },
    });

    this.logger.log(`PaymentIntent ${id} status updated to ${status}`);
  }

  /**
   * Processa aprovação de pagamento (webhook do PSP)
   *
   * FLUXO:
   * 1. CR wallet platform (gross)
   * 2. DR wallet gateway (gateway_fee)
   * 3. DR wallet platform (canneo_fee)
   * 4. CR wallet doctor (doctor_net) como PENDING
   * 5. Criar Hold com release_at = now + janela
   * 6. Criar Fee record
   */
  async processApproval(
    paymentIntentId: string,
    doctorId: string,
    pspPaymentId?: string,
  ): Promise<PaymentApprovalResult> {
    const paymentIntent = await this.getById(paymentIntentId);

    // Validar status
    if (paymentIntent.status !== PaymentIntentStatus.PENDING) {
      throw new ConflictException(
        `PaymentIntent ${paymentIntentId} is not pending, current status: ${paymentIntent.status}`,
      );
    }

    // Obter wallet do médico
    const doctorWallet = await this.walletService.getDoctorWallet(doctorId);

    // Calcular split
    const split = this.splitService.calculateSplit(
      paymentIntent.amountCents,
      paymentIntent.method,
    );

    // Executar transação atômica
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Atualizar status do PaymentIntent
      await tx.paymentIntent.update({
        where: { id: paymentIntentId },
        data: { status: PaymentIntentStatus.APPROVED },
      });

      // 2. Criar entradas no ledger
      const ledgerEntries = await this.ledgerService.createEntriesAtomic([
        // CR wallet platform (gross)
        {
          tenantId: paymentIntent.tenantId ?? undefined,
          walletId: WALLET_IDS.PLATFORM,
          direction: LedgerDirection.CR,
          amountCents: split.grossCents,
          entryType: LedgerEntryType.PAYMENT_APPROVED,
          referenceType: ResourceType.PAYMENT_INTENT,
          referenceId: paymentIntentId,
          idempotencyKey: `${paymentIntentId}:platform:cr`,
        },
        // DR wallet gateway (gateway_fee)
        {
          tenantId: paymentIntent.tenantId ?? undefined,
          walletId: WALLET_IDS.GATEWAY,
          direction: LedgerDirection.DR,
          amountCents: split.gatewayFeeCents,
          entryType: LedgerEntryType.GATEWAY_FEE,
          referenceType: ResourceType.PAYMENT_INTENT,
          referenceId: paymentIntentId,
          idempotencyKey: `${paymentIntentId}:gateway:dr`,
        },
        // DR wallet platform (canneo_fee)
        {
          tenantId: paymentIntent.tenantId ?? undefined,
          walletId: WALLET_IDS.PLATFORM,
          direction: LedgerDirection.DR,
          amountCents: split.canneoFeeCents,
          entryType: LedgerEntryType.CANNEO_FEE,
          referenceType: ResourceType.PAYMENT_INTENT,
          referenceId: paymentIntentId,
          idempotencyKey: `${paymentIntentId}:platform:fee`,
        },
        // CR wallet doctor (doctor_net) - como PENDING
        {
          tenantId: paymentIntent.tenantId ?? undefined,
          walletId: doctorWallet.id,
          direction: LedgerDirection.CR,
          amountCents: split.doctorNetCents,
          entryType: LedgerEntryType.DOCTOR_CREDIT_PENDING,
          referenceType: ResourceType.PAYMENT_INTENT,
          referenceId: paymentIntentId,
          idempotencyKey: `${paymentIntentId}:doctor:cr`,
        },
      ]);

      // 3. Atualizar saldos das wallets
      await this.walletService.creditAvailable(
        WALLET_IDS.PLATFORM,
        split.grossCents - split.canneoFeeCents,
      );

      await this.walletService.creditAvailable(
        WALLET_IDS.GATEWAY,
        split.gatewayFeeCents,
      );

      // Médico recebe como PENDING (não available ainda)
      await this.walletService.addToPending(
        doctorWallet.id,
        split.doctorNetCents,
      );

      // 4. Criar Hold com janela antifraude
      const releaseAt = this.splitService.calculateAntifraudWindow(
        paymentIntent.method,
      );

      const holdId = await this.holdService.createHold({
        tenantId: paymentIntent.tenantId ?? undefined,
        walletId: doctorWallet.id,
        paymentIntentId,
        amountCents: split.doctorNetCents,
        reason: HoldReason.ANTIFRAUD,
        releaseAt,
      });

      // 5. Criar Fee record
      const fee = await tx.fee.create({
        data: {
          tenantId: paymentIntent.tenantId,
          paymentIntentId,
          gatewayFeeCents: split.gatewayFeeCents,
          canneoFeeCents: split.canneoFeeCents,
          gatewayRateBps: split.gatewayRateBps,
          canneoRateBps: split.canneoRateBps,
        },
      });

      // 6. Registrar attempt se tiver pspPaymentId
      if (pspPaymentId) {
        await tx.paymentAttempt.create({
          data: {
            paymentIntentId,
            pspProvider: 'stripe', // TODO: configurável
            pspPaymentId,
            status: 'CAPTURED',
          },
        });
      }

      return {
        ledgerEntries,
        feeId: fee.id,
        holdId,
      };
    });

    this.logger.log(
      `PaymentIntent ${paymentIntentId} approved | Split: gross=${split.grossCents}, gateway=${split.gatewayFeeCents}, canneo=${split.canneoFeeCents}, doctor=${split.doctorNetCents}`,
    );

    return {
      paymentIntentId,
      ledgerEntries: result.ledgerEntries,
      feeId: result.feeId,
      holdId: result.holdId,
      splitCalculation: split,
    };
  }

  /**
   * Processa falha de pagamento
   */
  async processFailed(
    paymentIntentId: string,
    failureCode: string,
    failureMessage?: string,
  ): Promise<void> {
    const paymentIntent = await this.getById(paymentIntentId);

    if (paymentIntent.status === PaymentIntentStatus.APPROVED) {
      throw new ConflictException(
        `Cannot mark approved payment as failed: ${paymentIntentId}`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.paymentIntent.update({
        where: { id: paymentIntentId },
        data: { status: PaymentIntentStatus.FAILED },
      }),
      this.prisma.paymentAttempt.create({
        data: {
          paymentIntentId,
          pspProvider: 'stripe',
          status: 'FAILED',
          failureCode,
          rawPayload: failureMessage ? { message: failureMessage } : undefined,
        },
      }),
    ]);

    this.logger.log(
      `PaymentIntent ${paymentIntentId} failed | Code: ${failureCode}`,
    );
  }

  /**
   * Processa estorno
   *
   * REGRA: Estornos são feitos via contra-lançamento, NUNCA deletando entradas
   */
  async processRefund(input: RefundInput): Promise<string> {
    const paymentIntent = await this.getById(input.paymentIntentId);

    if (paymentIntent.status !== PaymentIntentStatus.APPROVED) {
      throw new BadRequestException(
        `Cannot refund payment that is not approved: ${input.paymentIntentId}`,
      );
    }

    // Criar refund record
    const refund = await this.prisma.refund.create({
      data: {
        tenantId: paymentIntent.tenantId,
        paymentIntentId: input.paymentIntentId,
        amountCents: input.amountCents,
        status: 'REQUESTED',
        reason: input.reason,
      },
    });

    // Criar entrada de estorno no ledger
    await this.ledgerService.createEntry({
      tenantId: paymentIntent.tenantId ?? undefined,
      walletId: WALLET_IDS.PLATFORM,
      direction: LedgerDirection.DR,
      amountCents: input.amountCents,
      entryType: LedgerEntryType.REFUND,
      referenceType: ResourceType.PAYMENT_INTENT,
      referenceId: input.paymentIntentId,
      idempotencyKey: `refund:${refund.id}`,
    });

    // Atualizar status do PaymentIntent
    await this.updateStatus(input.paymentIntentId, PaymentIntentStatus.REFUNDED);

    this.logger.log(
      `Refund processed for PaymentIntent ${input.paymentIntentId} | Amount: ${input.amountCents}`,
    );

    return refund.id;
  }

  /**
   * Processa chargeback
   */
  async processChargeback(
    paymentIntentId: string,
    amountCents: number,
  ): Promise<string> {
    const paymentIntent = await this.getById(paymentIntentId);

    if (paymentIntent.status !== PaymentIntentStatus.APPROVED) {
      throw new BadRequestException(
        `Cannot process chargeback for payment that is not approved: ${paymentIntentId}`,
      );
    }

    // Encontrar a wallet do médico relacionada
    // TODO: Melhorar lookup - por enquanto assume que tem appointment
    const appointment = await this.prisma.appointment.findFirst({
      where: { paymentIntentId },
      include: { doctor: { include: { wallet: true } } },
    });

    if (!appointment?.doctor?.wallet) {
      throw new BadRequestException(
        'Cannot find doctor wallet for chargeback',
      );
    }

    const doctorWalletId = appointment.doctor.wallet.id;

    // Criar chargeback record
    const chargeback = await this.prisma.chargeback.create({
      data: {
        tenantId: paymentIntent.tenantId,
        paymentIntentId,
        amountCents,
        status: 'OPEN',
        openedAt: new Date(),
      },
    });

    // Criar hold de chargeback na wallet do médico
    await this.holdService.createChargebackHold(
      doctorWalletId,
      paymentIntentId,
      amountCents,
      paymentIntent.tenantId ?? undefined,
    );

    // Atualizar status do PaymentIntent
    await this.updateStatus(paymentIntentId, PaymentIntentStatus.CHARGEBACK);

    this.logger.log(
      `Chargeback processed for PaymentIntent ${paymentIntentId} | Amount: ${amountCents}`,
    );

    return chargeback.id;
  }

  /**
   * Marca PaymentIntents expirados
   */
  async expireOldPaymentIntents(): Promise<number> {
    const result = await this.prisma.paymentIntent.updateMany({
      where: {
        status: { in: [PaymentIntentStatus.CREATED, PaymentIntentStatus.PENDING] },
        expiresAt: { lt: new Date() },
      },
      data: {
        status: PaymentIntentStatus.EXPIRED,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Expired ${result.count} payment intents`);
    }

    return result.count;
  }
}

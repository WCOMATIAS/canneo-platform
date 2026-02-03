import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  WebhookStatus,
  PaymentIntentStatus,
  AppointmentStatus,
  OrderStatus,
  LedgerDirection,
  LedgerEntryType,
  ResourceType,
  HoldReason,
} from '@prisma/client';
import { verifyHmacSignature, maskSensitiveData } from '../../common/webhook-utils';

export interface PspWebhookEvent {
  event_id: string;
  event_type: string;
  created_at: string;
  data: {
    payment_id: string;
    external_id?: string; // Our paymentIntentId
    status: string;
    amount: number;
    currency: string;
    payment_method: string;
    pix_code?: string;
    card_last_four?: string;
    failure_code?: string;
    failure_message?: string;
    refund?: {
      id: string;
      amount: number;
      reason?: string;
    };
    chargeback?: {
      id: string;
      amount: number;
      reason?: string;
    };
  };
}

@Injectable()
export class PspWebhookService {
  private readonly logger = new Logger(PspWebhookService.name);
  private readonly webhookSecret: string;

  constructor(private readonly prisma: PrismaService) {
    this.webhookSecret = process.env.PSP_WEBHOOK_SECRET || '';
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string): boolean {
    return verifyHmacSignature(payload, signature, this.webhookSecret);
  }

  /**
   * Process PSP webhook event
   */
  async processEvent(event: PspWebhookEvent): Promise<void> {
    this.logger.log(`Processing PSP event: ${event.event_type} - ${event.event_id}`);
    this.logger.debug(`Event data: ${JSON.stringify(maskSensitiveData(event as unknown as Record<string, unknown>))}`);

    // Check for idempotency
    const existingEvent = await this.prisma.webhookEvent.findUnique({
      where: {
        provider_eventId: {
          provider: 'PSP',
          eventId: event.event_id,
        },
      },
    });

    if (existingEvent) {
      this.logger.warn(`Duplicate event: ${event.event_id}`);
      return;
    }

    // Store webhook event
    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        provider: 'PSP',
        eventId: event.event_id,
        eventType: event.event_type,
        status: 'RECEIVED',
        rawPayload: event as unknown as Record<string, unknown>,
      },
    });

    try {
      // Process based on event type
      switch (event.event_type) {
        case 'payment.authorized':
        case 'payment.captured':
        case 'payment.approved':
          await this.handlePaymentApproved(event);
          break;

        case 'payment.failed':
        case 'payment.declined':
          await this.handlePaymentFailed(event);
          break;

        case 'payment.expired':
          await this.handlePaymentExpired(event);
          break;

        case 'payment.refunded':
          await this.handlePaymentRefunded(event);
          break;

        case 'payment.chargeback':
        case 'chargeback.opened':
          await this.handleChargeback(event);
          break;

        default:
          this.logger.warn(`Unknown event type: ${event.event_type}`);
      }

      // Mark as processed
      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to process event ${event.event_id}`,
        error instanceof Error ? error.stack : String(error)
      );

      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: 'FAILED' },
      });

      throw error;
    }
  }

  private async handlePaymentApproved(event: PspWebhookEvent): Promise<void> {
    const paymentIntentId = event.data.external_id;

    if (!paymentIntentId) {
      this.logger.warn('Payment approved without external_id');
      return;
    }

    const paymentIntent = await this.prisma.paymentIntent.findUnique({
      where: { id: paymentIntentId },
      include: {
        appointment: true,
        order: true,
      },
    });

    if (!paymentIntent) {
      this.logger.warn(`PaymentIntent not found: ${paymentIntentId}`);
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      // Update payment intent status
      await tx.paymentIntent.update({
        where: { id: paymentIntentId },
        data: { status: 'APPROVED' },
      });

      // Create payment attempt record
      await tx.paymentAttempt.create({
        data: {
          paymentIntentId,
          pspProvider: 'PSP',
          pspPaymentId: event.data.payment_id,
          status: 'CAPTURED',
          rawPayload: event.data as unknown as Record<string, unknown>,
        },
      });

      // Handle based on payment kind
      if (paymentIntent.kind === 'CONSULT' && paymentIntent.appointment) {
        // Update appointment status
        await tx.appointment.update({
          where: { id: paymentIntent.appointment.id },
          data: { status: 'CONFIRMED' },
        });

        // Process ledger entries for doctor
        await this.processConsultLedgerEntries(tx, paymentIntent);
      } else if (paymentIntent.kind === 'ORDER' && paymentIntent.order) {
        // Update order status
        await tx.order.update({
          where: { id: paymentIntent.order.id },
          data: { status: 'PAID' },
        });

        // Process ledger entries for pharmacy
        await this.processOrderLedgerEntries(tx, paymentIntent);
      }
    });

    this.logger.log(`Payment approved: ${paymentIntentId}`);
  }

  private async handlePaymentFailed(event: PspWebhookEvent): Promise<void> {
    const paymentIntentId = event.data.external_id;

    if (!paymentIntentId) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.paymentIntent.update({
        where: { id: paymentIntentId },
        data: { status: 'FAILED' },
      });

      await tx.paymentAttempt.create({
        data: {
          paymentIntentId,
          pspProvider: 'PSP',
          pspPaymentId: event.data.payment_id,
          status: 'FAILED',
          failureCode: event.data.failure_code,
          rawPayload: event.data as unknown as Record<string, unknown>,
        },
      });

      // Get related appointment/order and update status
      const paymentIntent = await tx.paymentIntent.findUnique({
        where: { id: paymentIntentId },
        include: { appointment: true, order: true },
      });

      if (paymentIntent?.appointment) {
        await tx.appointment.update({
          where: { id: paymentIntent.appointment.id },
          data: { status: 'CANCELLED' },
        });
      }

      if (paymentIntent?.order) {
        await tx.order.update({
          where: { id: paymentIntent.order.id },
          data: { status: 'CANCELLED' },
        });
      }
    });

    this.logger.log(`Payment failed: ${paymentIntentId}`);
  }

  private async handlePaymentExpired(event: PspWebhookEvent): Promise<void> {
    const paymentIntentId = event.data.external_id;

    if (!paymentIntentId) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.paymentIntent.update({
        where: { id: paymentIntentId },
        data: { status: 'EXPIRED' },
      });

      const paymentIntent = await tx.paymentIntent.findUnique({
        where: { id: paymentIntentId },
        include: { appointment: true, order: true },
      });

      if (paymentIntent?.appointment) {
        await tx.appointment.update({
          where: { id: paymentIntent.appointment.id },
          data: { status: 'CANCELLED' },
        });

        // Release the slot
        if (paymentIntent.appointment.slotId) {
          await tx.appointmentSlot.update({
            where: { id: paymentIntent.appointment.slotId },
            data: { isBooked: false },
          });
        }
      }
    });

    this.logger.log(`Payment expired: ${paymentIntentId}`);
  }

  private async handlePaymentRefunded(event: PspWebhookEvent): Promise<void> {
    const paymentIntentId = event.data.external_id;
    const refundData = event.data.refund;

    if (!paymentIntentId || !refundData) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.paymentIntent.update({
        where: { id: paymentIntentId },
        data: { status: 'REFUNDED' },
      });

      await tx.refund.create({
        data: {
          paymentIntentId,
          amountCents: refundData.amount,
          status: 'PAID',
          reason: refundData.reason,
        },
      });

      const paymentIntent = await tx.paymentIntent.findUnique({
        where: { id: paymentIntentId },
        include: { appointment: true, order: true },
      });

      if (paymentIntent?.appointment) {
        await tx.appointment.update({
          where: { id: paymentIntent.appointment.id },
          data: { status: 'REFUNDED' },
        });
      }

      if (paymentIntent?.order) {
        await tx.order.update({
          where: { id: paymentIntent.order.id },
          data: { status: 'REFUNDED' },
        });
      }

      // Create refund ledger entry
      // TODO: Reverse ledger entries
    });

    this.logger.log(`Payment refunded: ${paymentIntentId}`);
  }

  private async handleChargeback(event: PspWebhookEvent): Promise<void> {
    const paymentIntentId = event.data.external_id;
    const chargebackData = event.data.chargeback;

    if (!paymentIntentId || !chargebackData) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.paymentIntent.update({
        where: { id: paymentIntentId },
        data: { status: 'CHARGEBACK' },
      });

      await tx.chargeback.create({
        data: {
          paymentIntentId,
          amountCents: chargebackData.amount,
          status: 'OPEN',
          openedAt: new Date(),
        },
      });

      // Get payment intent with doctor wallet info
      const paymentIntent = await tx.paymentIntent.findUnique({
        where: { id: paymentIntentId },
        include: {
          appointment: {
            include: {
              doctor: {
                include: { wallet: true },
              },
            },
          },
        },
      });

      // Apply hold on doctor's wallet
      if (paymentIntent?.appointment?.doctor?.wallet) {
        const wallet = paymentIntent.appointment.doctor.wallet;

        await tx.hold.create({
          data: {
            paymentIntentId,
            walletId: wallet.id,
            amountCents: chargebackData.amount,
            reason: 'CHARGEBACK',
            status: 'ACTIVE',
            tenantId: paymentIntent.tenantId,
          },
        });

        // Create ledger entry for hold
        await tx.ledgerEntry.create({
          data: {
            walletId: wallet.id,
            direction: 'DR',
            amountCents: chargebackData.amount,
            entryType: 'CHARGEBACK_HOLD',
            referenceType: 'PAYMENT_INTENT',
            referenceId: paymentIntentId,
            tenantId: paymentIntent.tenantId,
          },
        });

        // Update wallet balance
        await tx.walletBalance.update({
          where: { walletId: wallet.id },
          data: {
            balanceAvailable: { decrement: chargebackData.amount },
            balanceOnHold: { increment: chargebackData.amount },
          },
        });
      }
    });

    this.logger.log(`Chargeback opened: ${paymentIntentId}`);
  }

  private async processConsultLedgerEntries(
    tx: any,
    paymentIntent: any
  ): Promise<void> {
    // Get doctor's wallet
    const doctor = await tx.doctor.findUnique({
      where: { id: paymentIntent.appointment.doctorId },
      include: { wallet: true },
    });

    if (!doctor?.wallet) {
      this.logger.warn(`Doctor wallet not found for ${paymentIntent.appointment.doctorId}`);
      return;
    }

    // Get fee rates (use defaults or from config)
    const gatewayRateBps = 249; // 2.49%
    const canneoRateBps = 1500; // 15%

    const gross = paymentIntent.amountCents;
    const gatewayFee = Math.round((gross * gatewayRateBps) / 10000);
    const netBase = gross - gatewayFee;
    const canneoFee = Math.round((netBase * canneoRateBps) / 10000);
    const doctorNet = netBase - canneoFee;

    // Create fee record
    await tx.fee.create({
      data: {
        paymentIntentId: paymentIntent.id,
        gatewayFeeCents: gatewayFee,
        canneoFeeCents: canneoFee,
        otherFeeCents: 0,
        gatewayRateBps,
        canneoRateBps,
        tenantId: paymentIntent.tenantId,
      },
    });

    // Create ledger entries
    const idempotencyPrefix = `${doctor.wallet.id}:${paymentIntent.id}`;

    // Doctor credit (pending)
    await tx.ledgerEntry.create({
      data: {
        walletId: doctor.wallet.id,
        direction: 'CR',
        amountCents: doctorNet,
        entryType: 'DOCTOR_CREDIT_PENDING',
        referenceType: 'PAYMENT_INTENT',
        referenceId: paymentIntent.id,
        idempotencyKey: `${idempotencyPrefix}:DOCTOR_CREDIT_PENDING`,
        tenantId: paymentIntent.tenantId,
      },
    });

    // Update wallet balances
    await tx.walletBalance.update({
      where: { walletId: doctor.wallet.id },
      data: {
        balanceTotal: { increment: doctorNet },
        balancePending: { increment: doctorNet },
      },
    });

    // Calculate hold release date based on payment method
    const holdDays = paymentIntent.method === 'PIX' ? 1 : paymentIntent.method === 'CARD_CREDIT' ? 7 : 2;
    const releaseAt = new Date();
    releaseAt.setDate(releaseAt.getDate() + holdDays);

    // Create antifraud hold
    await tx.hold.create({
      data: {
        paymentIntentId: paymentIntent.id,
        walletId: doctor.wallet.id,
        amountCents: doctorNet,
        reason: 'ANTIFRAUD',
        status: 'ACTIVE',
        releaseAt,
        tenantId: paymentIntent.tenantId,
      },
    });
  }

  private async processOrderLedgerEntries(
    tx: any,
    paymentIntent: any
  ): Promise<void> {
    // TODO: Implement order ledger entries for pharmacy
    // Similar to consult but for pharmacy wallet
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShipmentStatus } from '@prisma/client';
import { verifyHmacSignature, maskSensitiveData } from '../../common/webhook-utils';

export interface MelhorEnvioWebhookEvent {
  id: string;
  event: string;
  created_at: string;
  data: {
    id: string;
    order_id: string;
    status: string;
    tracking?: string;
    protocol?: string;
    reason?: string;
    notes?: string;
    delivered_at?: string;
    shipped_at?: string;
    events?: Array<{
      date: string;
      status: string;
      description: string;
      location?: string;
    }>;
  };
}

@Injectable()
export class MelhorEnvioWebhookService {
  private readonly logger = new Logger(MelhorEnvioWebhookService.name);
  private readonly webhookSecret: string;

  constructor(private readonly prisma: PrismaService) {
    this.webhookSecret = process.env.MELHOR_ENVIO_WEBHOOK_SECRET || '';
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string): boolean {
    return verifyHmacSignature(payload, signature, this.webhookSecret);
  }

  /**
   * Process Melhor Envio webhook event
   */
  async processEvent(event: MelhorEnvioWebhookEvent): Promise<void> {
    this.logger.log(`Processing Melhor Envio event: ${event.event} - ${event.id}`);
    this.logger.debug(`Event data: ${JSON.stringify(maskSensitiveData(event as unknown as Record<string, unknown>))}`);

    // Check for idempotency
    const existingEvent = await this.prisma.webhookEvent.findUnique({
      where: {
        provider_eventId: {
          provider: 'MELHOR_ENVIO',
          eventId: event.id,
        },
      },
    });

    if (existingEvent) {
      this.logger.warn(`Duplicate event: ${event.id}`);
      return;
    }

    // Store webhook event
    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        provider: 'MELHOR_ENVIO',
        eventId: event.id,
        eventType: event.event,
        status: 'RECEIVED',
        rawPayload: event as unknown as Record<string, unknown>,
      },
    });

    try {
      // Find shipment by Melhor Envio ID
      const shipment = await this.prisma.shipment.findFirst({
        where: { melhorEnvioShipmentId: event.data.id },
        include: { order: true },
      });

      if (!shipment) {
        this.logger.warn(`Shipment not found for Melhor Envio ID: ${event.data.id}`);
        return;
      }

      // Process based on event type
      switch (event.event) {
        case 'shipment.posted':
        case 'shipment.in_transit':
          await this.handleInTransit(shipment.id, event);
          break;

        case 'shipment.out_for_delivery':
          await this.handleOutForDelivery(shipment.id, event);
          break;

        case 'shipment.delivered':
          await this.handleDelivered(shipment.id, event);
          break;

        case 'shipment.failed':
        case 'shipment.exception':
          await this.handleFailed(shipment.id, event);
          break;

        case 'shipment.returned':
          await this.handleReturned(shipment.id, event);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.event}`);
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
        `Failed to process event ${event.id}`,
        error instanceof Error ? error.stack : String(error)
      );

      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: 'FAILED' },
      });

      throw error;
    }
  }

  private async handleInTransit(
    shipmentId: string,
    event: MelhorEnvioWebhookEvent
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: 'IN_TRANSIT',
          trackingCode: event.data.tracking || undefined,
          shippedAt: event.data.shipped_at ? new Date(event.data.shipped_at) : new Date(),
        },
      });

      // Update order status
      const shipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
      });

      if (shipment) {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: { status: 'SHIPPED' },
        });
      }
    });

    this.logger.log(`Shipment ${shipmentId} in transit`);
  }

  private async handleOutForDelivery(
    shipmentId: string,
    event: MelhorEnvioWebhookEvent
  ): Promise<void> {
    await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status: 'OUT_FOR_DELIVERY',
      },
    });

    this.logger.log(`Shipment ${shipmentId} out for delivery`);
  }

  private async handleDelivered(
    shipmentId: string,
    event: MelhorEnvioWebhookEvent
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: 'DELIVERED',
          deliveredAt: event.data.delivered_at
            ? new Date(event.data.delivered_at)
            : new Date(),
        },
      });

      // Update order status
      const shipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
      });

      if (shipment) {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: { status: 'DELIVERED' },
        });
      }
    });

    this.logger.log(`Shipment ${shipmentId} delivered`);
  }

  private async handleFailed(
    shipmentId: string,
    event: MelhorEnvioWebhookEvent
  ): Promise<void> {
    await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status: 'FAILED',
      },
    });

    this.logger.log(`Shipment ${shipmentId} failed: ${event.data.reason || 'Unknown reason'}`);
  }

  private async handleReturned(
    shipmentId: string,
    event: MelhorEnvioWebhookEvent
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: 'RETURNED',
        },
      });

      // Update order status - might need manual intervention
      const shipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
      });

      if (shipment) {
        // Don't automatically cancel order - let staff handle returns
        this.logger.warn(`Shipment ${shipmentId} returned - order ${shipment.orderId} needs attention`);
      }
    });

    this.logger.log(`Shipment ${shipmentId} returned`);
  }
}

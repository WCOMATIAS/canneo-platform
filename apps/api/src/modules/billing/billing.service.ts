import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCurrentSubscription(organizationId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription não encontrada');
    }

    return subscription;
  }

  async createCheckoutSession(
    organizationId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly',
  ) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    // TODO: Integrar com Stripe
    // Por enquanto, retorna URL placeholder
    const checkoutUrl = `https://checkout.stripe.com/placeholder?plan=${plan.name}&cycle=${billingCycle}`;

    return { checkoutUrl };
  }

  async createPortalSession(organizationId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription?.stripeCustomerId) {
      throw new BadRequestException('Organização não possui cliente Stripe');
    }

    // TODO: Integrar com Stripe
    const portalUrl = `https://billing.stripe.com/placeholder?customer=${subscription.stripeCustomerId}`;

    return { portalUrl };
  }

  async cancelSubscription(organizationId: string, reason?: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription não encontrada');
    }

    // TODO: Cancelar no Stripe

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        cancelReason: reason,
      },
    });
  }

  async handleWebhook(event: any) {
    // TODO: Processar webhooks do Stripe
    // - checkout.session.completed -> Atualizar subscription para ACTIVE
    // - invoice.payment_succeeded -> Renovar período
    // - invoice.payment_failed -> Marcar como PAST_DUE
    // - customer.subscription.deleted -> Marcar como CANCELED

    return { received: true };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class BillingService implements OnModuleInit {
  private stripe: Stripe | null = null;
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey);
      this.logger.log('Stripe initialized successfully');
    } else {
      this.logger.warn('Stripe secret key not configured - billing features disabled');
    }
  }

  // ============================================================================
  // PLANS
  // ============================================================================

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // ============================================================================
  // SUBSCRIPTION
  // ============================================================================

  async getCurrentSubscription(organizationId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription nao encontrada');
    }

    return subscription;
  }

  // ============================================================================
  // CHECKOUT SESSION
  // ============================================================================

  async createCheckoutSession(
    organizationId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly',
  ) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano nao encontrado');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        memberships: {
          where: { role: 'OWNER' },
          include: { user: true },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organizacao nao encontrada');
    }

    // Get owner email
    const ownerEmail = organization.memberships[0]?.user?.email;

    // Check if Stripe is configured
    if (!this.stripe) {
      this.logger.warn('Stripe not configured - returning mock checkout URL');
      return {
        checkoutUrl: `/billing/success?session_id=mock_${Date.now()}`,
        sessionId: `mock_${Date.now()}`,
      };
    }

    // Get existing subscription to check for customer ID
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    // Determine which price to use
    const priceId = billingCycle === 'yearly'
      ? plan.stripePriceIdYearly
      : plan.stripePriceIdMonthly;

    if (!priceId) {
      throw new BadRequestException(
        `Plano ${plan.name} nao possui preco Stripe configurado para ${billingCycle}`,
      );
    }

    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    try {
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/billing?canceled=true`,
        metadata: {
          organizationId,
          planId,
          billingCycle,
        },
        subscription_data: {
          metadata: {
            organizationId,
            planId,
          },
        },
      };

      // If customer exists, use it
      if (existingSubscription?.stripeCustomerId) {
        sessionParams.customer = existingSubscription.stripeCustomerId;
      } else if (ownerEmail) {
        // Create or lookup customer by email
        sessionParams.customer_email = ownerEmail;
      }

      const session = await this.stripe.checkout.sessions.create(sessionParams);

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    } catch (error: any) {
      this.logger.error('Stripe checkout session error:', error.message);
      throw new BadRequestException(`Erro ao criar sessao de checkout: ${error.message}`);
    }
  }

  // ============================================================================
  // PORTAL SESSION
  // ============================================================================

  async createPortalSession(organizationId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription?.stripeCustomerId) {
      throw new BadRequestException('Organizacao nao possui cliente Stripe');
    }

    if (!this.stripe) {
      this.logger.warn('Stripe not configured - returning mock portal URL');
      return {
        portalUrl: '/billing',
      };
    }

    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${baseUrl}/billing`,
      });

      return {
        portalUrl: session.url,
      };
    } catch (error: any) {
      this.logger.error('Stripe portal session error:', error.message);
      throw new BadRequestException(`Erro ao criar sessao do portal: ${error.message}`);
    }
  }

  // ============================================================================
  // CANCEL SUBSCRIPTION
  // ============================================================================

  async cancelSubscription(organizationId: string, reason?: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription nao encontrada');
    }

    // Cancel in Stripe if connected
    if (this.stripe && subscription.stripeSubId) {
      try {
        await this.stripe.subscriptions.update(subscription.stripeSubId, {
          cancel_at_period_end: true,
          metadata: {
            cancelReason: reason || 'User requested',
          },
        });
        this.logger.log(`Stripe subscription ${subscription.stripeSubId} marked for cancellation`);
      } catch (error: any) {
        this.logger.error('Stripe cancel error:', error.message);
        // Continue to update local record even if Stripe fails
      }
    }

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        cancelReason: reason,
      },
    });
  }

  // ============================================================================
  // WEBHOOK HANDLER
  // ============================================================================

  async handleWebhook(payload: Buffer, signature: string) {
    if (!this.stripe) {
      this.logger.warn('Stripe not configured - ignoring webhook');
      return { received: true };
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      if (webhookSecret) {
        event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } else {
        // In dev/test, parse raw body (not secure for production)
        event = JSON.parse(payload.toString());
        this.logger.warn('Webhook signature verification skipped (no secret configured)');
      }
    } catch (error: any) {
      this.logger.error('Webhook signature verification failed:', error.message);
      throw new BadRequestException('Webhook signature verification failed');
    }

    this.logger.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  // ============================================================================
  // WEBHOOK EVENT HANDLERS
  // ============================================================================

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const organizationId = session.metadata?.organizationId;
    const planId = session.metadata?.planId;
    const billingCycle = session.metadata?.billingCycle || 'monthly';

    if (!organizationId || !planId) {
      this.logger.error('Missing metadata in checkout session');
      return;
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    if (subscription) {
      // Update existing subscription
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          planId,
          status: 'ACTIVE',
          billingCycle,
          stripeCustomerId: session.customer as string,
          stripeSubId: session.subscription as string,
          trialEndsAt: null,
          currentPeriodStart: new Date(),
          currentPeriodEnd: this.calculatePeriodEnd(billingCycle),
        },
      });
    } else {
      // Create new subscription
      await this.prisma.subscription.create({
        data: {
          organizationId,
          planId,
          status: 'ACTIVE',
          billingCycle,
          stripeCustomerId: session.customer as string,
          stripeSubId: session.subscription as string,
          currentPeriodStart: new Date(),
          currentPeriodEnd: this.calculatePeriodEnd(billingCycle),
        },
      });
    }

    this.logger.log(`Checkout completed for organization ${organizationId}`);
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    const organizationId = stripeSubscription.metadata?.organizationId;

    if (!organizationId) {
      // Try to find by Stripe subscription ID
      const subscription = await this.prisma.subscription.findFirst({
        where: { stripeSubId: stripeSubscription.id },
      });

      if (!subscription) {
        this.logger.warn(`No subscription found for Stripe sub ${stripeSubscription.id}`);
        return;
      }

      await this.updateSubscriptionFromStripe(subscription.id, stripeSubscription);
      return;
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    if (subscription) {
      await this.updateSubscriptionFromStripe(subscription.id, stripeSubscription);
    }
  }

  private async updateSubscriptionFromStripe(
    subscriptionId: string,
    stripeSubscription: Stripe.Subscription,
  ) {
    const subData = stripeSubscription as any;
    const statusMap: Record<string, string> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      unpaid: 'PAST_DUE',
      trialing: 'TRIAL',
    };

    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: (statusMap[subData.status] || 'ACTIVE') as any,
        currentPeriodStart: subData.current_period_start
          ? new Date(subData.current_period_start * 1000)
          : new Date(),
        currentPeriodEnd: subData.current_period_end
          ? new Date(subData.current_period_end * 1000)
          : this.calculatePeriodEnd('monthly'),
        stripeSubId: stripeSubscription.id,
        stripeCustomerId: typeof subData.customer === 'string'
          ? subData.customer
          : subData.customer?.id,
      },
    });

    this.logger.log(`Subscription ${subscriptionId} updated from Stripe`);
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubId: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.warn(`No subscription found for deleted Stripe sub ${stripeSubscription.id}`);
      return;
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });

    this.logger.log(`Subscription ${subscription.id} marked as canceled`);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const invoiceData = invoice as any;
    const subscriptionId = typeof invoiceData.subscription === 'string'
      ? invoiceData.subscription
      : invoiceData.subscription?.id;

    if (!subscriptionId) return;

    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubId: subscriptionId },
    });

    if (!subscription) return;

    // Update period dates
    const billingCycle = subscription.billingCycle || 'monthly';

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.calculatePeriodEnd(billingCycle),
      },
    });

    this.logger.log(`Invoice payment succeeded for subscription ${subscription.id}`);
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const invoiceData = invoice as any;
    const subscriptionId = typeof invoiceData.subscription === 'string'
      ? invoiceData.subscription
      : invoiceData.subscription?.id;

    if (!subscriptionId) return;

    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubId: subscriptionId },
    });

    if (!subscription) return;

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'PAST_DUE',
      },
    });

    this.logger.log(`Invoice payment failed for subscription ${subscription.id}`);

    // TODO: Send email notification about failed payment
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private calculatePeriodEnd(billingCycle: string): Date {
    const now = new Date();
    if (billingCycle === 'yearly') {
      return new Date(now.setFullYear(now.getFullYear() + 1));
    }
    return new Date(now.setMonth(now.getMonth() + 1));
  }

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

  async syncPlansFromStripe() {
    if (!this.stripe) {
      throw new BadRequestException('Stripe nao configurado');
    }

    const prices = await this.stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    this.logger.log(`Found ${prices.data.length} active prices in Stripe`);

    return prices.data.map((price) => ({
      id: price.id,
      product: (price.product as Stripe.Product)?.name || 'Unknown',
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval,
    }));
  }

  async getSubscriptionUsage(organizationId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { organizationId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription nao encontrada');
    }

    // Count current usage
    const [doctorsCount, patientsCount, consultationsThisMonth] = await Promise.all([
      this.prisma.membership.count({
        where: {
          organizationId,
          role: 'DOCTOR',
          isActive: true,
        },
      }),
      this.prisma.patient.count({
        where: { organizationId },
      }),
      this.prisma.consultation.count({
        where: {
          organizationId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan.displayName,
        billingCycle: subscription.billingCycle,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      usage: {
        doctors: {
          current: doctorsCount,
          limit: subscription.plan.maxDoctors,
          percentage: subscription.plan.maxDoctors > 0
            ? Math.round((doctorsCount / subscription.plan.maxDoctors) * 100)
            : 0,
        },
        patients: {
          current: patientsCount,
          limit: subscription.plan.maxPatients,
          percentage: subscription.plan.maxPatients > 0
            ? Math.round((patientsCount / subscription.plan.maxPatients) * 100)
            : 0,
        },
        consultations: {
          current: consultationsThisMonth,
          limit: subscription.plan.maxConsultations,
          percentage: subscription.plan.maxConsultations > 0
            ? Math.round((consultationsThisMonth / subscription.plan.maxConsultations) * 100)
            : 0,
        },
      },
    };
  }
}

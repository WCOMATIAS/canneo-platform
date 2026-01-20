import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /**
   * Lista planos disponiveis
   */
  @Public()
  @Get('plans')
  async getPlans() {
    return this.billingService.getPlans();
  }

  /**
   * Retorna subscription atual da organizacao
   */
  @Get('subscription')
  @UseGuards(TenantGuard)
  async getCurrentSubscription(@Req() req: any) {
    return this.billingService.getCurrentSubscription(req.organizationId);
  }

  /**
   * Retorna uso atual da subscription
   */
  @Get('usage')
  @UseGuards(TenantGuard)
  async getSubscriptionUsage(@Req() req: any) {
    return this.billingService.getSubscriptionUsage(req.organizationId);
  }

  /**
   * Cria sessao de checkout (Stripe)
   */
  @Post('checkout')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  async createCheckoutSession(
    @Req() req: any,
    @Body() body: { planId: string; billingCycle: 'monthly' | 'yearly' },
  ) {
    return this.billingService.createCheckoutSession(
      req.organizationId,
      body.planId,
      body.billingCycle,
    );
  }

  /**
   * Cria sessao do portal de billing (Stripe)
   */
  @Post('portal')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  async createPortalSession(@Req() req: any) {
    return this.billingService.createPortalSession(req.organizationId);
  }

  /**
   * Cancela subscription
   */
  @Post('cancel')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('OWNER')
  async cancelSubscription(
    @Req() req: any,
    @Body() body: { reason?: string },
  ) {
    return this.billingService.cancelSubscription(req.organizationId, body.reason);
  }

  /**
   * Webhook do Stripe
   * Requires raw body for signature verification
   */
  @Public()
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { received: true, error: 'No raw body' };
    }
    return this.billingService.handleWebhook(rawBody, signature);
  }
}

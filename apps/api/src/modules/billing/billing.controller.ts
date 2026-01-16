import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
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
   * Lista planos disponíveis
   */
  @Public()
  @Get('plans')
  async getPlans() {
    return this.billingService.getPlans();
  }

  /**
   * Retorna subscription atual da organização
   */
  @Get('subscription')
  @UseGuards(TenantGuard)
  async getCurrentSubscription(@Req() req: any) {
    return this.billingService.getCurrentSubscription(req.organizationId);
  }

  /**
   * Cria sessão de checkout (Stripe)
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
   * Cria sessão do portal de billing (Stripe)
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
   */
  @Public()
  @Post('webhook')
  async handleWebhook(@Req() req: RawBodyRequest<any>) {
    // TODO: Verificar assinatura do webhook
    const event = req.body;
    return this.billingService.handleWebhook(event);
  }
}

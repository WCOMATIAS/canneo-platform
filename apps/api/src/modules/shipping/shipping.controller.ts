import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { createHash } from 'crypto';
import { ShippingService } from './services/shipping.service';
import {
  GetShippingQuotesDto,
  ShippingQuoteResponseDto,
  CreateShipmentDto,
  ShipmentResponseDto,
  TrackingResponseDto,
  LabelResponseDto,
} from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AuditContext } from '../audit';

interface AuthenticatedUser {
  id: string;
  role: string;
  tenantId?: string;
  pharmacyId?: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  /**
   * Get shipping quotes
   */
  @Post('quotes')
  @Roles('PATIENT', 'PHARMACY', 'ADMIN', 'OPERATIONS')
  async getQuotes(
    @Body() dto: GetShippingQuotesDto
  ): Promise<ShippingQuoteResponseDto[]> {
    return this.shippingService.getQuotes(dto);
  }

  /**
   * Create a shipment (pharmacy)
   */
  @Post()
  @Roles('PHARMACY', 'ADMIN', 'OPERATIONS')
  async createShipment(
    @Body() dto: CreateShipmentDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: AuthenticatedRequest
  ): Promise<ShipmentResponseDto> {
    const auditContext = this.buildAuditContext(req, user);
    return this.shippingService.createShipment(dto, auditContext);
  }

  /**
   * Generate shipping label (pharmacy)
   */
  @Post(':id/label')
  @Roles('PHARMACY', 'ADMIN', 'OPERATIONS')
  async generateLabel(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: AuthenticatedRequest
  ): Promise<LabelResponseDto> {
    const auditContext = this.buildAuditContext(req, user);
    return this.shippingService.generateLabel(id, auditContext);
  }

  /**
   * Get shipment by ID
   */
  @Get(':id')
  @Roles('PATIENT', 'PHARMACY', 'ADMIN', 'OPERATIONS')
  async getById(@Param('id') id: string): Promise<ShipmentResponseDto> {
    return this.shippingService.findById(id);
  }

  /**
   * Get shipment by order ID
   */
  @Get('order/:orderId')
  @Roles('PATIENT', 'PHARMACY', 'ADMIN', 'OPERATIONS')
  async getByOrderId(
    @Param('orderId') orderId: string
  ): Promise<ShipmentResponseDto | null> {
    return this.shippingService.findByOrderId(orderId);
  }

  /**
   * Track shipment (public - patients can track without auth via tracking code)
   */
  @Get(':id/track')
  @Public()
  async track(@Param('id') id: string): Promise<TrackingResponseDto> {
    return this.shippingService.track(id);
  }

  private buildAuditContext(
    req: AuthenticatedRequest,
    user: AuthenticatedUser
  ): AuditContext {
    const ip = this.getClientIp(req);
    const userAgent = req.headers['user-agent'];

    return {
      actorUserId: user.id,
      actorRole: user.role as AuditContext['actorRole'],
      tenantId: user.tenantId,
      ipMasked: ip ? this.maskIp(ip) : undefined,
      userAgentHash: userAgent ? this.hashUserAgent(userAgent) : undefined,
      correlationId: req.headers['x-correlation-id'] as string,
    };
  }

  private getClientIp(req: Request): string | undefined {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return ips.trim();
    }
    return req.ip || req.socket.remoteAddress;
  }

  private maskIp(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.XXX.XXX`;
    }
    return 'XXX.XXX.XXX.XXX';
  }

  private hashUserAgent(userAgent: string): string {
    return createHash('sha256').update(userAgent).digest('hex').slice(0, 16);
  }
}

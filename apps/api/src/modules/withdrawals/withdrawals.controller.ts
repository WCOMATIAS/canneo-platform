import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { createHash } from 'crypto';
import { WithdrawalService } from './services/withdrawal.service';
import {
  CreateWithdrawalDto,
  QueryWithdrawalsDto,
  UpdateWithdrawalStatusDto,
  WithdrawalResponseDto,
  PaginatedWithdrawalsResponseDto,
  WithdrawalSummaryDto,
} from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequiresStepUp } from '../auth/decorators/step-up.decorator';
import { AuditContext } from '../audit';

interface AuthenticatedUser {
  id: string;
  role: string;
  tenantId?: string;
  doctorId?: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  /**
   * Create a withdrawal request (doctor)
   */
  @Post()
  @Roles('DOCTOR')
  @RequiresStepUp('withdrawal')
  async create(
    @Body() dto: CreateWithdrawalDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: AuthenticatedRequest
  ): Promise<WithdrawalResponseDto> {
    if (!user.doctorId) {
      throw new Error('Doctor ID not found');
    }

    const auditContext = this.buildAuditContext(req, user);
    return this.withdrawalService.create(user.doctorId, dto, auditContext);
  }

  /**
   * Get my withdrawals (doctor)
   */
  @Get('me')
  @Roles('DOCTOR')
  async getMyWithdrawals(
    @Query() dto: QueryWithdrawalsDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PaginatedWithdrawalsResponseDto> {
    if (!user.doctorId) {
      throw new Error('Doctor ID not found');
    }
    return this.withdrawalService.findByDoctor(user.doctorId, dto);
  }

  /**
   * Get my withdrawal summary (doctor)
   */
  @Get('me/summary')
  @Roles('DOCTOR')
  async getMySummary(
    @CurrentUser() user: AuthenticatedUser
  ): Promise<WithdrawalSummaryDto> {
    if (!user.doctorId) {
      throw new Error('Doctor ID not found');
    }
    return this.withdrawalService.getSummary(user.doctorId);
  }

  /**
   * Get withdrawal by ID (doctor - own only)
   */
  @Get(':id')
  @Roles('DOCTOR')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<WithdrawalResponseDto> {
    return this.withdrawalService.findById(id, user.doctorId);
  }

  /**
   * Cancel a withdrawal (doctor)
   */
  @Patch(':id/cancel')
  @Roles('DOCTOR')
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: AuthenticatedRequest
  ): Promise<WithdrawalResponseDto> {
    if (!user.doctorId) {
      throw new Error('Doctor ID not found');
    }
    const auditContext = this.buildAuditContext(req, user);
    return this.withdrawalService.cancel(id, user.doctorId, auditContext);
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Get all withdrawals (admin)
   */
  @Get('admin/all')
  @Roles('ADMIN', 'OPERATIONS')
  async getAllWithdrawals(
    @Query() dto: QueryWithdrawalsDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PaginatedWithdrawalsResponseDto> {
    return this.withdrawalService.findAll(dto, user.tenantId);
  }

  /**
   * Get withdrawal by ID (admin)
   */
  @Get('admin/:id')
  @Roles('ADMIN', 'OPERATIONS')
  async getByIdAdmin(@Param('id') id: string): Promise<WithdrawalResponseDto> {
    return this.withdrawalService.findById(id);
  }

  /**
   * Update withdrawal status (admin)
   */
  @Patch('admin/:id/status')
  @Roles('ADMIN', 'OPERATIONS')
  @RequiresStepUp('withdrawal')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateWithdrawalStatusDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: AuthenticatedRequest
  ): Promise<WithdrawalResponseDto> {
    const auditContext = this.buildAuditContext(req, user);
    return this.withdrawalService.updateStatus(id, dto.status, auditContext, {
      failureReason: dto.failureReason,
      pspPayoutId: dto.pspPayoutId,
    });
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

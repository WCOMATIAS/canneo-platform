import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard, RolesGuard, MfaGuard, StepUpGuard } from '../auth/guards';
import { Roles, CurrentUser, RequiresStepUp } from '../auth/decorators';
import { AuthenticatedUser } from '../../common/interfaces/auth.interface';
import { PaymentIntentService } from './services/payment-intent.service';
import { WalletService } from './services/wallet.service';
import { LedgerService } from './services/ledger.service';
import { SplitService } from './services/split.service';
import { HoldReleaseScheduler } from './jobs/hold-release.scheduler';
import {
  CreatePaymentIntentDto,
  PaymentIntentResponseDto,
  ProcessApprovalDto,
  ProcessRefundDto,
  SplitCalculationResponseDto,
  WalletBalanceResponseDto,
  WalletStatementResponseDto,
} from './dto';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard, MfaGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    private readonly paymentIntentService: PaymentIntentService,
    private readonly walletService: WalletService,
    private readonly ledgerService: LedgerService,
    private readonly splitService: SplitService,
    private readonly holdReleaseScheduler: HoldReleaseScheduler,
  ) {}

  // ============================================
  // PAYMENT INTENTS
  // ============================================

  @Post('intents')
  @Roles(UserRole.PATIENT, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar PaymentIntent' })
  @ApiResponse({ status: 201, type: PaymentIntentResponseDto })
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaymentIntentResponseDto> {
    const id = await this.paymentIntentService.create({
      ...dto,
      customerUserId: user.id,
      tenantId: user.tenantId,
    });

    const paymentIntent = await this.paymentIntentService.getById(id);

    return {
      id: paymentIntent.id,
      kind: paymentIntent.kind,
      method: paymentIntent.method,
      status: paymentIntent.status,
      amountCents: paymentIntent.amountCents,
      currency: paymentIntent.currency,
      expiresAt: paymentIntent.expiresAt!,
      createdAt: paymentIntent.createdAt,
    };
  }

  @Get('intents/:id')
  @ApiOperation({ summary: 'Obter PaymentIntent por ID' })
  @ApiParam({ name: 'id', description: 'ID do PaymentIntent' })
  @ApiResponse({ status: 200, type: PaymentIntentResponseDto })
  async getPaymentIntent(
    @Param('id') id: string,
  ): Promise<PaymentIntentResponseDto> {
    const paymentIntent = await this.paymentIntentService.getById(id);

    return {
      id: paymentIntent.id,
      kind: paymentIntent.kind,
      method: paymentIntent.method,
      status: paymentIntent.status,
      amountCents: paymentIntent.amountCents,
      currency: paymentIntent.currency,
      expiresAt: paymentIntent.expiresAt!,
      createdAt: paymentIntent.createdAt,
    };
  }

  @Post('intents/:id/approve')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprovar pagamento (simula webhook PSP)' })
  @ApiParam({ name: 'id', description: 'ID do PaymentIntent' })
  async approvePayment(
    @Param('id') id: string,
    @Body() dto: ProcessApprovalDto,
  ) {
    const result = await this.paymentIntentService.processApproval(
      id,
      dto.doctorId,
      dto.pspPaymentId,
    );

    return {
      success: true,
      paymentIntentId: result.paymentIntentId,
      split: result.splitCalculation,
    };
  }

  @Post('intents/:id/refund')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Processar estorno' })
  @ApiParam({ name: 'id', description: 'ID do PaymentIntent' })
  async refundPayment(
    @Param('id') id: string,
    @Body() dto: ProcessRefundDto,
  ) {
    const refundId = await this.paymentIntentService.processRefund({
      paymentIntentId: id,
      amountCents: dto.amountCents,
      reason: dto.reason,
    });

    return { success: true, refundId };
  }

  // ============================================
  // SPLIT CALCULATION
  // ============================================

  @Get('split/calculate')
  @ApiOperation({ summary: 'Simular cálculo de split' })
  @ApiQuery({ name: 'amountCents', type: Number })
  @ApiQuery({ name: 'method', enum: ['PIX', 'CARD_CREDIT', 'CARD_DEBIT'] })
  @ApiResponse({ status: 200, type: SplitCalculationResponseDto })
  calculateSplit(
    @Query('amountCents') amountCents: number,
    @Query('method') method: 'PIX' | 'CARD_CREDIT' | 'CARD_DEBIT',
  ): SplitCalculationResponseDto {
    const split = this.splitService.calculateSplit(
      Number(amountCents),
      method,
    );

    return {
      grossCents: split.grossCents,
      gatewayFeeCents: split.gatewayFeeCents,
      canneoFeeCents: split.canneoFeeCents,
      doctorNetCents: split.doctorNetCents,
      gatewayRateBps: split.gatewayRateBps,
      canneoRateBps: split.canneoRateBps,
    };
  }

  // ============================================
  // WALLETS
  // ============================================

  @Get('wallets/me')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Obter saldo da wallet do médico autenticado' })
  @ApiResponse({ status: 200, type: WalletBalanceResponseDto })
  async getMyWallet(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WalletBalanceResponseDto> {
    // Buscar doctor pelo userId
    const doctor = await this.walletService['prisma'].doctor.findUnique({
      where: { userId: user.id },
    });

    if (!doctor) {
      throw new Error('Doctor profile not found');
    }

    return this.walletService.getDoctorWallet(doctor.id);
  }

  @Get('wallets/me/statement')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Extrato da wallet do médico' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, type: [WalletStatementResponseDto] })
  async getMyStatement(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<WalletStatementResponseDto[]> {
    const doctor = await this.walletService['prisma'].doctor.findUnique({
      where: { userId: user.id },
      include: { wallet: true },
    });

    if (!doctor?.wallet) {
      throw new Error('Doctor wallet not found');
    }

    const entries = await this.ledgerService.getWalletEntries(doctor.wallet.id, {
      limit: limit ?? 50,
      offset: offset ?? 0,
    });

    return entries.map((entry) => ({
      id: entry.id,
      direction: entry.direction,
      amountCents: entry.amountCents,
      entryType: entry.entryType,
      referenceType: entry.referenceType,
      referenceId: entry.referenceId,
      createdAt: entry.createdAt,
    }));
  }

  @Get('wallets/:walletId')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Obter saldo de uma wallet (admin)' })
  @ApiParam({ name: 'walletId', description: 'ID da Wallet' })
  @ApiResponse({ status: 200, type: WalletBalanceResponseDto })
  async getWallet(
    @Param('walletId') walletId: string,
  ): Promise<WalletBalanceResponseDto> {
    return this.walletService.getWallet(walletId);
  }

  // ============================================
  // ADMIN: HOLD MANAGEMENT
  // ============================================

  @Post('admin/holds/process')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forçar processamento de holds (admin)' })
  async processHoldsNow() {
    const jobId = await this.holdReleaseScheduler.triggerNow();
    return { success: true, jobId };
  }
}

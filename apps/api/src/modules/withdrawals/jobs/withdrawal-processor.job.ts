import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma';
import { WithdrawalService } from '../services/withdrawal.service';
import { PayoutService } from '../services/payout.service';
import { WITHDRAWAL_PROCESSING } from '../constants/withdrawal.constants';

@Injectable()
export class WithdrawalProcessorJob implements OnModuleInit {
  private readonly logger = new Logger(WithdrawalProcessorJob.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly withdrawalService: WithdrawalService,
    private readonly payoutService: PayoutService
  ) {}

  onModuleInit() {
    this.logger.log('Withdrawal processor job initialized');
  }

  /**
   * Validate pending withdrawals (every 5 minutes)
   */
  @Cron('*/5 * * * *')
  async validatePendingWithdrawals() {
    if (this.isProcessing) {
      this.logger.debug('Skipping validation - already processing');
      return;
    }

    try {
      this.isProcessing = true;

      const pendingWithdrawals = await this.prisma.withdrawal.findMany({
        where: { status: 'REQUESTED' },
        take: 100,
        orderBy: { requestedAt: 'asc' },
      });

      this.logger.log(`Validating ${pendingWithdrawals.length} pending withdrawals`);

      for (const withdrawal of pendingWithdrawals) {
        try {
          const validation = await this.payoutService.validateWithdrawal(withdrawal.id);

          if (validation.valid) {
            await this.withdrawalService.updateStatus(
              withdrawal.id,
              'VALIDATING',
              { actorUserId: 'system' }
            );

            // Move to scheduled immediately after validation
            await this.withdrawalService.updateStatus(
              withdrawal.id,
              'SCHEDULED',
              { actorUserId: 'system' }
            );
          } else {
            this.logger.warn(
              `Withdrawal ${withdrawal.id} validation failed: ${validation.reason}`
            );
            await this.withdrawalService.updateStatus(
              withdrawal.id,
              'FAILED',
              { actorUserId: 'system' },
              { failureReason: validation.reason }
            );
          }
        } catch (error) {
          this.logger.error(
            `Error validating withdrawal ${withdrawal.id}`,
            error instanceof Error ? error.stack : String(error)
          );
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process scheduled withdrawals (every 15 minutes during business hours)
   */
  @Cron('*/15 9-18 * * 1-5') // Every 15 min, 9am-6pm, Mon-Fri
  async processScheduledWithdrawals() {
    if (this.isProcessing) {
      this.logger.debug('Skipping processing - already running');
      return;
    }

    try {
      this.isProcessing = true;

      const scheduledWithdrawals = await this.payoutService.getPendingWithdrawals();

      this.logger.log(`Processing ${scheduledWithdrawals.length} scheduled withdrawals`);

      for (const withdrawal of scheduledWithdrawals) {
        try {
          // Mark as processing
          await this.withdrawalService.updateStatus(
            withdrawal.id,
            'PROCESSING',
            { actorUserId: 'system' }
          );

          // Process payout
          const result = await this.payoutService.processPayout({
            withdrawalId: withdrawal.id,
            amountCents: withdrawal.amountCents,
            pixKey: withdrawal.bankAccount.pixKeyEnc,
            bankCode: withdrawal.bankAccount.bankCode || undefined,
            branch: withdrawal.bankAccount.branch || undefined,
            account: withdrawal.bankAccount.account || undefined,
            accountDigit: withdrawal.bankAccount.accountDigit || undefined,
          });

          if (result.success) {
            await this.withdrawalService.updateStatus(
              withdrawal.id,
              'PAID',
              { actorUserId: 'system' },
              { pspPayoutId: result.pspPayoutId }
            );
            this.logger.log(`Withdrawal ${withdrawal.id} paid successfully`);
          } else {
            await this.withdrawalService.updateStatus(
              withdrawal.id,
              'FAILED',
              { actorUserId: 'system' },
              { failureReason: result.error }
            );
            this.logger.warn(`Withdrawal ${withdrawal.id} failed: ${result.error}`);
          }
        } catch (error) {
          this.logger.error(
            `Error processing withdrawal ${withdrawal.id}`,
            error instanceof Error ? error.stack : String(error)
          );

          // Try to mark as failed
          try {
            await this.withdrawalService.updateStatus(
              withdrawal.id,
              'FAILED',
              { actorUserId: 'system' },
              { failureReason: 'Internal processing error' }
            );
          } catch {
            // Ignore
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

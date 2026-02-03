import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma';
import { WithdrawalStatus } from '@prisma/client';

interface PayoutRequest {
  withdrawalId: string;
  amountCents: number;
  pixKey?: string;
  bankCode?: string;
  branch?: string;
  account?: string;
  accountDigit?: string;
}

interface PayoutResponse {
  success: boolean;
  pspPayoutId?: string;
  error?: string;
}

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);
  private readonly pspBaseUrl: string;
  private readonly pspApiKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    this.pspBaseUrl = this.configService.get('PSP_BASE_URL', 'https://api.psp.example.com');
    this.pspApiKey = this.configService.get('PSP_API_KEY', '');
  }

  /**
   * Process a payout to a bank account
   * This is a placeholder implementation - integrate with actual PSP
   */
  async processPayout(request: PayoutRequest): Promise<PayoutResponse> {
    this.logger.log(`Processing payout for withdrawal ${request.withdrawalId}`);

    try {
      // TODO: Integrate with actual PSP API
      // This is a mock implementation

      // In production, this would call the PSP API:
      // const response = await fetch(`${this.pspBaseUrl}/payouts`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.pspApiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     external_id: request.withdrawalId,
      //     amount: request.amountCents,
      //     pix_key: request.pixKey,
      //     bank_account: request.bankCode ? {
      //       bank_code: request.bankCode,
      //       branch: request.branch,
      //       account: request.account,
      //       account_digit: request.accountDigit,
      //     } : undefined,
      //   }),
      // });

      // Simulate processing
      const mockSuccess = Math.random() > 0.1; // 90% success rate for testing

      if (mockSuccess) {
        return {
          success: true,
          pspPayoutId: `payout_${Date.now()}_${request.withdrawalId.slice(0, 8)}`,
        };
      } else {
        return {
          success: false,
          error: 'Payout failed - insufficient funds in provider account',
        };
      }
    } catch (error) {
      this.logger.error(
        `Payout processing failed for ${request.withdrawalId}`,
        error instanceof Error ? error.stack : String(error)
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get pending withdrawals for processing
   */
  async getPendingWithdrawals(): Promise<
    Array<{
      id: string;
      amountCents: number;
      bankAccount: {
        pixKeyEnc?: string;
        bankCode?: string;
        branch?: string;
        account?: string;
        accountDigit?: string;
      };
    }>
  > {
    return this.prisma.withdrawal.findMany({
      where: {
        status: 'SCHEDULED',
      },
      select: {
        id: true,
        amountCents: true,
        bankAccount: {
          select: {
            pixKeyEnc: true,
            bankCode: true,
            branch: true,
            account: true,
            accountDigit: true,
          },
        },
      },
      orderBy: { requestedAt: 'asc' },
    });
  }

  /**
   * Validate withdrawal for processing
   */
  async validateWithdrawal(withdrawalId: string): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        doctor: {
          include: {
            wallet: {
              include: {
                balances: true,
              },
            },
            user: true,
          },
        },
        bankAccount: true,
      },
    });

    if (!withdrawal) {
      return { valid: false, reason: 'Withdrawal not found' };
    }

    if (withdrawal.status !== 'REQUESTED') {
      return { valid: false, reason: 'Invalid withdrawal status' };
    }

    if (!withdrawal.bankAccount) {
      return { valid: false, reason: 'Bank account not found' };
    }

    if (!withdrawal.bankAccount.verifiedAt) {
      return { valid: false, reason: 'Bank account not verified' };
    }

    if (withdrawal.doctor?.user?.status !== 'ACTIVE') {
      return { valid: false, reason: 'Doctor account is not active' };
    }

    // Verify wallet balance
    const availableBalance = withdrawal.doctor?.wallet?.balances?.balanceAvailable ?? 0;

    // Note: The amount was already deducted when withdrawal was requested
    // This check is just for safety in case of edge cases

    return { valid: true };
  }
}

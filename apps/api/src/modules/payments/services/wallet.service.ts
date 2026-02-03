import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WalletOwnerType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WALLET_IDS } from '../constants/payment.constants';

export interface WalletWithBalance {
  id: string;
  ownerType: WalletOwnerType;
  ownerId: string | null;
  currency: string;
  balanceTotal: number;
  balancePending: number;
  balanceAvailable: number;
  balanceOnHold: number;
  balanceWithdrawn: number;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtém wallet com saldos
   */
  async getWallet(walletId: string): Promise<WalletWithBalance> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: { balances: true },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet ${walletId} not found`);
    }

    return {
      id: wallet.id,
      ownerType: wallet.ownerType,
      ownerId: wallet.ownerId,
      currency: wallet.currency,
      balanceTotal: wallet.balances?.balanceTotal ?? 0,
      balancePending: wallet.balances?.balancePending ?? 0,
      balanceAvailable: wallet.balances?.balanceAvailable ?? 0,
      balanceOnHold: wallet.balances?.balanceOnHold ?? 0,
      balanceWithdrawn: wallet.balances?.balanceWithdrawn ?? 0,
    };
  }

  /**
   * Obtém wallet do médico pelo doctorId
   */
  async getDoctorWallet(doctorId: string): Promise<WalletWithBalance> {
    const wallet = await this.prisma.wallet.findFirst({
      where: {
        ownerType: WalletOwnerType.DOCTOR,
        doctorId,
      },
      include: { balances: true },
    });

    if (!wallet) {
      throw new NotFoundException(`Doctor wallet not found for ${doctorId}`);
    }

    return {
      id: wallet.id,
      ownerType: wallet.ownerType,
      ownerId: wallet.ownerId,
      currency: wallet.currency,
      balanceTotal: wallet.balances?.balanceTotal ?? 0,
      balancePending: wallet.balances?.balancePending ?? 0,
      balanceAvailable: wallet.balances?.balanceAvailable ?? 0,
      balanceOnHold: wallet.balances?.balanceOnHold ?? 0,
      balanceWithdrawn: wallet.balances?.balanceWithdrawn ?? 0,
    };
  }

  /**
   * Obtém wallet da plataforma
   */
  async getPlatformWallet(): Promise<WalletWithBalance> {
    return this.getWallet(WALLET_IDS.PLATFORM);
  }

  /**
   * Obtém wallet do gateway
   */
  async getGatewayWallet(): Promise<WalletWithBalance> {
    return this.getWallet(WALLET_IDS.GATEWAY);
  }

  /**
   * Adiciona valor ao saldo pendente
   * (usado quando pagamento é aprovado mas ainda está na janela antifraude)
   */
  async addToPending(walletId: string, amountCents: number): Promise<void> {
    this.validateAmount(amountCents);

    await this.prisma.walletBalance.update({
      where: { walletId },
      data: {
        balanceTotal: { increment: amountCents },
        balancePending: { increment: amountCents },
      },
    });

    this.logger.log(`Added ${amountCents} cents to pending for wallet ${walletId}`);
  }

  /**
   * Move valor de pendente para disponível
   * (usado quando janela antifraude expira)
   */
  async movePendingToAvailable(
    walletId: string,
    amountCents: number,
  ): Promise<void> {
    this.validateAmount(amountCents);

    const wallet = await this.getWallet(walletId);

    if (wallet.balancePending < amountCents) {
      throw new BadRequestException(
        `Insufficient pending balance. Has: ${wallet.balancePending}, needs: ${amountCents}`,
      );
    }

    await this.prisma.walletBalance.update({
      where: { walletId },
      data: {
        balancePending: { decrement: amountCents },
        balanceAvailable: { increment: amountCents },
      },
    });

    this.logger.log(
      `Moved ${amountCents} cents from pending to available for wallet ${walletId}`,
    );
  }

  /**
   * Move valor de disponível para em espera (hold)
   * (usado para antifraude ou chargeback)
   */
  async moveAvailableToHold(
    walletId: string,
    amountCents: number,
  ): Promise<void> {
    this.validateAmount(amountCents);

    const wallet = await this.getWallet(walletId);

    if (wallet.balanceAvailable < amountCents) {
      throw new BadRequestException(
        `Insufficient available balance. Has: ${wallet.balanceAvailable}, needs: ${amountCents}`,
      );
    }

    await this.prisma.walletBalance.update({
      where: { walletId },
      data: {
        balanceAvailable: { decrement: amountCents },
        balanceOnHold: { increment: amountCents },
      },
    });

    this.logger.log(
      `Moved ${amountCents} cents from available to hold for wallet ${walletId}`,
    );
  }

  /**
   * Move valor de em espera para disponível
   * (usado quando hold é liberado)
   */
  async moveHoldToAvailable(
    walletId: string,
    amountCents: number,
  ): Promise<void> {
    this.validateAmount(amountCents);

    const wallet = await this.getWallet(walletId);

    if (wallet.balanceOnHold < amountCents) {
      throw new BadRequestException(
        `Insufficient hold balance. Has: ${wallet.balanceOnHold}, needs: ${amountCents}`,
      );
    }

    await this.prisma.walletBalance.update({
      where: { walletId },
      data: {
        balanceOnHold: { decrement: amountCents },
        balanceAvailable: { increment: amountCents },
      },
    });

    this.logger.log(
      `Moved ${amountCents} cents from hold to available for wallet ${walletId}`,
    );
  }

  /**
   * Registra um saque (decrementa available, incrementa withdrawn)
   */
  async recordWithdrawal(walletId: string, amountCents: number): Promise<void> {
    this.validateAmount(amountCents);

    const wallet = await this.getWallet(walletId);

    if (wallet.balanceAvailable < amountCents) {
      throw new BadRequestException(
        `Insufficient available balance for withdrawal. Has: ${wallet.balanceAvailable}, needs: ${amountCents}`,
      );
    }

    await this.prisma.walletBalance.update({
      where: { walletId },
      data: {
        balanceAvailable: { decrement: amountCents },
        balanceWithdrawn: { increment: amountCents },
      },
    });

    this.logger.log(
      `Recorded withdrawal of ${amountCents} cents for wallet ${walletId}`,
    );
  }

  /**
   * Reverte um saque falho
   */
  async revertWithdrawal(walletId: string, amountCents: number): Promise<void> {
    this.validateAmount(amountCents);

    await this.prisma.walletBalance.update({
      where: { walletId },
      data: {
        balanceAvailable: { increment: amountCents },
        balanceWithdrawn: { decrement: amountCents },
      },
    });

    this.logger.log(
      `Reverted withdrawal of ${amountCents} cents for wallet ${walletId}`,
    );
  }

  /**
   * Debita saldo (para taxas, etc.)
   */
  async debit(walletId: string, amountCents: number): Promise<void> {
    this.validateAmount(amountCents);

    await this.prisma.walletBalance.update({
      where: { walletId },
      data: {
        balanceTotal: { decrement: amountCents },
        balanceAvailable: { decrement: amountCents },
      },
    });

    this.logger.log(`Debited ${amountCents} cents from wallet ${walletId}`);
  }

  /**
   * Credita saldo diretamente como disponível
   */
  async creditAvailable(walletId: string, amountCents: number): Promise<void> {
    this.validateAmount(amountCents);

    await this.prisma.walletBalance.update({
      where: { walletId },
      data: {
        balanceTotal: { increment: amountCents },
        balanceAvailable: { increment: amountCents },
      },
    });

    this.logger.log(
      `Credited ${amountCents} cents as available to wallet ${walletId}`,
    );
  }

  /**
   * Valida que o valor é um inteiro positivo
   */
  private validateAmount(amountCents: number): void {
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      throw new BadRequestException(
        'Amount must be a positive integer (cents)',
      );
    }
  }
}

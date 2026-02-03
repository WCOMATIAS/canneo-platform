import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { WithdrawalStatus, LedgerDirection, LedgerEntryType, ResourceType, Prisma } from '@prisma/client';
import { AuditService, AuditContext } from '../../audit';
import { AUDIT_ACTIONS } from '../../audit/constants/audit.constants';
import {
  CreateWithdrawalDto,
  QueryWithdrawalsDto,
  WithdrawalResponseDto,
  PaginatedWithdrawalsResponseDto,
  WithdrawalSummaryDto,
  BankAccountResponseDto,
} from '../dto';
import {
  MIN_WITHDRAWAL_CENTS,
  isValidWithdrawalTransition,
} from '../constants/withdrawal.constants';

@Injectable()
export class WithdrawalService {
  private readonly logger = new Logger(WithdrawalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Create a new withdrawal request
   */
  async create(
    doctorId: string,
    dto: CreateWithdrawalDto,
    auditContext: AuditContext
  ): Promise<WithdrawalResponseDto> {
    // Get doctor's wallet
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        wallet: {
          include: {
            balances: true,
          },
        },
        user: {
          select: { fullName: true },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Médico não encontrado');
    }

    if (!doctor.wallet) {
      throw new BadRequestException('Carteira não encontrada');
    }

    // Verify bank account belongs to doctor
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: {
        id: dto.bankAccountId,
        ownerType: 'DOCTOR',
        ownerId: doctorId,
      },
    });

    if (!bankAccount) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    if (!bankAccount.verifiedAt) {
      throw new BadRequestException('Conta bancária não verificada');
    }

    // Check available balance
    const availableBalance = doctor.wallet.balances?.balanceAvailable ?? 0;

    if (dto.amountCents > availableBalance) {
      throw new BadRequestException(
        `Saldo disponível insuficiente. Disponível: R$ ${(availableBalance / 100).toFixed(2)}`
      );
    }

    if (dto.amountCents < MIN_WITHDRAWAL_CENTS) {
      throw new BadRequestException(
        `Valor mínimo para saque: R$ ${(MIN_WITHDRAWAL_CENTS / 100).toFixed(2)}`
      );
    }

    // Create withdrawal and ledger entries in transaction
    const withdrawal = await this.prisma.$transaction(async (tx) => {
      // Create withdrawal record
      const withdrawal = await tx.withdrawal.create({
        data: {
          doctorId,
          walletId: doctor.wallet!.id,
          bankAccountId: dto.bankAccountId,
          amountCents: dto.amountCents,
          currency: 'BRL',
          status: 'REQUESTED',
          tenantId: doctor.tenantId,
        },
        include: {
          bankAccount: true,
          doctor: {
            include: {
              user: { select: { fullName: true } },
            },
          },
        },
      });

      // Create ledger entry (DR from available balance)
      const idempotencyKey = `${doctor.wallet!.id}:WITHDRAWAL_REQUESTED:${withdrawal.id}`;

      await tx.ledgerEntry.create({
        data: {
          walletId: doctor.wallet!.id,
          direction: LedgerDirection.DR,
          amountCents: dto.amountCents,
          currency: 'BRL',
          entryType: LedgerEntryType.WITHDRAWAL_REQUESTED,
          referenceType: ResourceType.WITHDRAWAL,
          referenceId: withdrawal.id,
          idempotencyKey,
          tenantId: doctor.tenantId,
        },
      });

      // Update wallet balance
      await tx.walletBalance.update({
        where: { walletId: doctor.wallet!.id },
        data: {
          balanceAvailable: { decrement: dto.amountCents },
        },
      });

      return withdrawal;
    });

    // Audit log
    await this.auditService.log(
      AUDIT_ACTIONS.WITHDRAWAL_REQUEST,
      ResourceType.WITHDRAWAL,
      withdrawal.id,
      auditContext,
      { amountCents: dto.amountCents }
    );

    return this.toResponseDto(withdrawal);
  }

  /**
   * Get withdrawal by ID
   */
  async findById(
    withdrawalId: string,
    doctorId?: string
  ): Promise<WithdrawalResponseDto> {
    const where: Prisma.WithdrawalWhereUniqueInput = { id: withdrawalId };

    const withdrawal = await this.prisma.withdrawal.findUnique({
      where,
      include: {
        bankAccount: true,
        doctor: {
          include: {
            user: { select: { fullName: true } },
          },
        },
      },
    });

    if (!withdrawal) {
      throw new NotFoundException('Saque não encontrado');
    }

    // If doctorId is provided, verify ownership
    if (doctorId && withdrawal.doctorId !== doctorId) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.toResponseDto(withdrawal);
  }

  /**
   * Get withdrawals for a doctor
   */
  async findByDoctor(
    doctorId: string,
    dto: QueryWithdrawalsDto
  ): Promise<PaginatedWithdrawalsResponseDto> {
    const where: Prisma.WithdrawalWhereInput = { doctorId };

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.startDate || dto.endDate) {
      where.requestedAt = {};
      if (dto.startDate) {
        where.requestedAt.gte = new Date(dto.startDate);
      }
      if (dto.endDate) {
        where.requestedAt.lte = new Date(dto.endDate);
      }
    }

    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where,
        include: {
          bankAccount: true,
          doctor: {
            include: {
              user: { select: { fullName: true } },
            },
          },
        },
        orderBy: { requestedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.withdrawal.count({ where }),
    ]);

    return {
      data: withdrawals.map((w) => this.toResponseDto(w)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all withdrawals (admin)
   */
  async findAll(
    dto: QueryWithdrawalsDto,
    tenantId?: string
  ): Promise<PaginatedWithdrawalsResponseDto> {
    const where: Prisma.WithdrawalWhereInput = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.startDate || dto.endDate) {
      where.requestedAt = {};
      if (dto.startDate) {
        where.requestedAt.gte = new Date(dto.startDate);
      }
      if (dto.endDate) {
        where.requestedAt.lte = new Date(dto.endDate);
      }
    }

    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where,
        include: {
          bankAccount: true,
          doctor: {
            include: {
              user: { select: { fullName: true } },
            },
          },
        },
        orderBy: { requestedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.withdrawal.count({ where }),
    ]);

    return {
      data: withdrawals.map((w) => this.toResponseDto(w)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update withdrawal status (internal use)
   */
  async updateStatus(
    withdrawalId: string,
    newStatus: WithdrawalStatus,
    auditContext: AuditContext,
    options?: {
      failureReason?: string;
      pspPayoutId?: string;
    }
  ): Promise<WithdrawalResponseDto> {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        wallet: true,
      },
    });

    if (!withdrawal) {
      throw new NotFoundException('Saque não encontrado');
    }

    // Validate state transition
    if (!isValidWithdrawalTransition(withdrawal.status, newStatus)) {
      throw new BadRequestException(
        `Transição de status inválida: ${withdrawal.status} -> ${newStatus}`
      );
    }

    const updateData: Prisma.WithdrawalUpdateInput = {
      status: newStatus,
    };

    if (options?.failureReason) {
      updateData.failureReason = options.failureReason;
    }

    if (options?.pspPayoutId) {
      updateData.pspPayoutId = options.pspPayoutId;
    }

    if (newStatus === 'PAID' || newStatus === 'FAILED') {
      updateData.processedAt = new Date();
    }

    // Handle ledger entries for status changes
    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: updateData,
        include: {
          bankAccount: true,
          doctor: {
            include: {
              user: { select: { fullName: true } },
            },
          },
        },
      });

      // Create appropriate ledger entries
      if (newStatus === 'PAID') {
        const idempotencyKey = `${withdrawal.walletId}:WITHDRAWAL_PAID:${withdrawal.id}`;

        await tx.ledgerEntry.create({
          data: {
            walletId: withdrawal.walletId,
            direction: LedgerDirection.DR,
            amountCents: withdrawal.amountCents,
            currency: 'BRL',
            entryType: LedgerEntryType.WITHDRAWAL_PAID,
            referenceType: ResourceType.WITHDRAWAL,
            referenceId: withdrawal.id,
            idempotencyKey,
            tenantId: withdrawal.tenantId,
          },
        });

        // Update withdrawn balance
        await tx.walletBalance.update({
          where: { walletId: withdrawal.walletId },
          data: {
            balanceWithdrawn: { increment: withdrawal.amountCents },
          },
        });
      } else if (newStatus === 'FAILED' || newStatus === 'CANCELLED') {
        // Return funds to available balance
        const idempotencyKey = `${withdrawal.walletId}:WITHDRAWAL_FAILED_RETURN:${withdrawal.id}`;

        await tx.ledgerEntry.create({
          data: {
            walletId: withdrawal.walletId,
            direction: LedgerDirection.CR,
            amountCents: withdrawal.amountCents,
            currency: 'BRL',
            entryType: LedgerEntryType.WITHDRAWAL_FAILED_RETURN,
            referenceType: ResourceType.WITHDRAWAL,
            referenceId: withdrawal.id,
            idempotencyKey,
            tenantId: withdrawal.tenantId,
          },
        });

        await tx.walletBalance.update({
          where: { walletId: withdrawal.walletId },
          data: {
            balanceAvailable: { increment: withdrawal.amountCents },
          },
        });
      }

      return updated;
    });

    // Audit log
    const auditAction = this.getAuditAction(newStatus);
    await this.auditService.log(
      auditAction,
      ResourceType.WITHDRAWAL,
      withdrawalId,
      auditContext,
      { newStatus, failureReason: options?.failureReason }
    );

    return this.toResponseDto(result);
  }

  /**
   * Cancel a withdrawal (doctor)
   */
  async cancel(
    withdrawalId: string,
    doctorId: string,
    auditContext: AuditContext
  ): Promise<WithdrawalResponseDto> {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new NotFoundException('Saque não encontrado');
    }

    if (withdrawal.doctorId !== doctorId) {
      throw new ForbiddenException('Acesso negado');
    }

    if (!['REQUESTED', 'VALIDATING', 'SCHEDULED'].includes(withdrawal.status)) {
      throw new BadRequestException(
        'Saque não pode ser cancelado neste status'
      );
    }

    return this.updateStatus(withdrawalId, 'CANCELLED', auditContext);
  }

  /**
   * Get withdrawal summary for a doctor
   */
  async getSummary(doctorId: string): Promise<WithdrawalSummaryDto> {
    const withdrawals = await this.prisma.withdrawal.findMany({
      where: { doctorId },
      select: {
        status: true,
        amountCents: true,
      },
    });

    const summary: WithdrawalSummaryDto = {
      totalRequested: 0,
      totalPending: 0,
      totalPaid: 0,
      totalFailed: 0,
      count: {
        requested: 0,
        validating: 0,
        scheduled: 0,
        processing: 0,
        paid: 0,
        failed: 0,
      },
    };

    for (const w of withdrawals) {
      summary.totalRequested += w.amountCents;

      switch (w.status) {
        case 'REQUESTED':
          summary.count.requested++;
          summary.totalPending += w.amountCents;
          break;
        case 'VALIDATING':
          summary.count.validating++;
          summary.totalPending += w.amountCents;
          break;
        case 'SCHEDULED':
          summary.count.scheduled++;
          summary.totalPending += w.amountCents;
          break;
        case 'PROCESSING':
          summary.count.processing++;
          summary.totalPending += w.amountCents;
          break;
        case 'PAID':
          summary.count.paid++;
          summary.totalPaid += w.amountCents;
          break;
        case 'FAILED':
          summary.count.failed++;
          summary.totalFailed += w.amountCents;
          break;
      }
    }

    return summary;
  }

  private getAuditAction(status: WithdrawalStatus): string {
    switch (status) {
      case 'VALIDATING':
        return AUDIT_ACTIONS.WITHDRAWAL_VALIDATE;
      case 'SCHEDULED':
        return AUDIT_ACTIONS.WITHDRAWAL_SCHEDULE;
      case 'PROCESSING':
        return AUDIT_ACTIONS.WITHDRAWAL_PROCESS;
      case 'PAID':
        return AUDIT_ACTIONS.WITHDRAWAL_COMPLETE;
      case 'FAILED':
        return AUDIT_ACTIONS.WITHDRAWAL_FAIL;
      case 'CANCELLED':
        return AUDIT_ACTIONS.WITHDRAWAL_CANCEL;
      default:
        return 'WITHDRAWAL_STATUS_CHANGE';
    }
  }

  private toResponseDto(
    withdrawal: Prisma.WithdrawalGetPayload<{
      include: {
        bankAccount: true;
        doctor: { include: { user: { select: { fullName: true } } } };
      };
    }>
  ): WithdrawalResponseDto {
    return {
      id: withdrawal.id,
      doctorId: withdrawal.doctorId,
      doctorName: withdrawal.doctor?.user?.fullName,
      amountCents: withdrawal.amountCents,
      currency: withdrawal.currency,
      status: withdrawal.status,
      requestedAt: withdrawal.requestedAt,
      processedAt: withdrawal.processedAt || undefined,
      failureReason: withdrawal.failureReason || undefined,
      bankAccount: withdrawal.bankAccount
        ? this.toBankAccountResponseDto(withdrawal.bankAccount)
        : undefined,
    };
  }

  private toBankAccountResponseDto(
    bankAccount: Prisma.BankAccountGetPayload<{}>
  ): BankAccountResponseDto {
    return {
      id: bankAccount.id,
      bankCode: bankAccount.bankCode || undefined,
      branch: bankAccount.branch || undefined,
      accountMasked: bankAccount.account
        ? `****${bankAccount.account.slice(-4)}`
        : undefined,
      pixKeyMasked: bankAccount.pixKeyEnc
        ? '****' + bankAccount.pixKeyEnc.slice(-4)
        : undefined,
      verifiedAt: bankAccount.verifiedAt || undefined,
    };
  }
}

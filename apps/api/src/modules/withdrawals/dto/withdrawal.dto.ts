import {
  IsString,
  IsInt,
  IsPositive,
  Min,
  Max,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WithdrawalStatus } from '@prisma/client';
import { MIN_WITHDRAWAL_CENTS, MAX_WITHDRAWAL_CENTS } from '../constants/withdrawal.constants';

export class CreateWithdrawalDto {
  @IsString()
  bankAccountId: string;

  @IsInt()
  @IsPositive()
  @Min(MIN_WITHDRAWAL_CENTS, {
    message: `Valor mínimo para saque é R$ ${(MIN_WITHDRAWAL_CENTS / 100).toFixed(2)}`,
  })
  @Max(MAX_WITHDRAWAL_CENTS, {
    message: `Valor máximo para saque é R$ ${(MAX_WITHDRAWAL_CENTS / 100).toFixed(2)}`,
  })
  amountCents: number;
}

export class QueryWithdrawalsDto {
  @IsOptional()
  @IsEnum(WithdrawalStatus)
  status?: WithdrawalStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class UpdateWithdrawalStatusDto {
  @IsEnum(WithdrawalStatus)
  status: WithdrawalStatus;

  @IsOptional()
  @IsString()
  failureReason?: string;

  @IsOptional()
  @IsString()
  pspPayoutId?: string;
}

export class BankAccountResponseDto {
  id: string;
  bankCode?: string;
  branch?: string;
  accountMasked?: string;
  pixKeyMasked?: string;
  verifiedAt?: Date;
}

export class WithdrawalResponseDto {
  id: string;
  doctorId: string;
  doctorName?: string;
  amountCents: number;
  currency: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  processedAt?: Date;
  failureReason?: string;
  bankAccount?: BankAccountResponseDto;
}

export class PaginatedWithdrawalsResponseDto {
  data: WithdrawalResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class WithdrawalSummaryDto {
  totalRequested: number;
  totalPending: number;
  totalPaid: number;
  totalFailed: number;
  count: {
    requested: number;
    validating: number;
    scheduled: number;
    processing: number;
    paid: number;
    failed: number;
  };
}

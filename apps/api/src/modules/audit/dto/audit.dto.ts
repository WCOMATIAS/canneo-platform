import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceType } from '@prisma/client';

export class CreateAuditLogDto {
  @IsString()
  action: string;

  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @IsString()
  resourceId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  correlationId?: string;
}

export class QueryAuditLogsDto {
  @IsOptional()
  @IsEnum(ResourceType)
  resourceType?: ResourceType;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsString()
  actorUserId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  correlationId?: string;

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

export class AuditLogResponseDto {
  id: string;
  actorUserId?: string;
  actorName?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  correlationId?: string;
  ipMasked?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export class PaginatedAuditLogsResponseDto {
  data: AuditLogResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

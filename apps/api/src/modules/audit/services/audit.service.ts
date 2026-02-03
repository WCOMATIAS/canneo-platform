import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { ResourceType, UserRole, Prisma } from '@prisma/client';
import {
  CreateAuditLogDto,
  QueryAuditLogsDto,
  AuditLogResponseDto,
  PaginatedAuditLogsResponseDto,
} from '../dto';

export interface AuditContext {
  actorUserId?: string;
  actorRole?: UserRole;
  tenantId?: string;
  ipMasked?: string;
  userAgentHash?: string;
  correlationId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an immutable audit log entry
   * This method should never throw - audit failures are logged but don't break operations
   */
  async log(
    action: string,
    resourceType: ResourceType,
    resourceId: string,
    context: AuditContext,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          resourceType,
          resourceId,
          actorUserId: context.actorUserId,
          actorRole: context.actorRole,
          tenantId: context.tenantId,
          ipMasked: context.ipMasked,
          userAgentHash: context.userAgentHash,
          correlationId: context.correlationId,
          metadata: metadata as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      // Audit failures should not break the application
      // Log the error and continue
      this.logger.error(
        `Failed to create audit log: ${action} for ${resourceType}:${resourceId}`,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }

  /**
   * Batch create audit logs (for bulk operations)
   */
  async logBatch(
    entries: Array<{
      action: string;
      resourceType: ResourceType;
      resourceId: string;
      metadata?: Record<string, unknown>;
    }>,
    context: AuditContext
  ): Promise<void> {
    try {
      await this.prisma.auditLog.createMany({
        data: entries.map((entry) => ({
          action: entry.action,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          actorUserId: context.actorUserId,
          actorRole: context.actorRole,
          tenantId: context.tenantId,
          ipMasked: context.ipMasked,
          userAgentHash: context.userAgentHash,
          correlationId: context.correlationId,
          metadata: entry.metadata as Prisma.InputJsonValue,
        })),
      });
    } catch (error) {
      this.logger.error(
        `Failed to create batch audit logs`,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }

  /**
   * Query audit logs with pagination and filtering
   */
  async query(dto: QueryAuditLogsDto, tenantId?: string): Promise<PaginatedAuditLogsResponseDto> {
    const where: Prisma.AuditLogWhereInput = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (dto.resourceType) {
      where.resourceType = dto.resourceType;
    }

    if (dto.resourceId) {
      where.resourceId = dto.resourceId;
    }

    if (dto.actorUserId) {
      where.actorUserId = dto.actorUserId;
    }

    if (dto.action) {
      where.action = { contains: dto.action, mode: 'insensitive' };
    }

    if (dto.correlationId) {
      where.correlationId = dto.correlationId;
    }

    if (dto.startDate || dto.endDate) {
      where.createdAt = {};
      if (dto.startDate) {
        where.createdAt.gte = new Date(dto.startDate);
      }
      if (dto.endDate) {
        where.createdAt.lte = new Date(dto.endDate);
      }
    }

    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          actorUser: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((log) => this.toResponseDto(log)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get audit trail for a specific resource
   */
  async getResourceAuditTrail(
    resourceType: ResourceType,
    resourceId: string,
    tenantId?: string
  ): Promise<AuditLogResponseDto[]> {
    const where: Prisma.AuditLogWhereInput = {
      resourceType,
      resourceId,
    };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      include: {
        actorUser: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return logs.map((log) => this.toResponseDto(log));
  }

  /**
   * Get all logs for a correlation ID (trace a request)
   */
  async getByCorrelationId(correlationId: string): Promise<AuditLogResponseDto[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { correlationId },
      include: {
        actorUser: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return logs.map((log) => this.toResponseDto(log));
  }

  /**
   * Get recent activity for a user
   */
  async getUserActivity(
    userId: string,
    limit = 50,
    tenantId?: string
  ): Promise<AuditLogResponseDto[]> {
    const where: Prisma.AuditLogWhereInput = {
      actorUserId: userId,
    };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      include: {
        actorUser: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs.map((log) => this.toResponseDto(log));
  }

  private toResponseDto(
    log: Prisma.AuditLogGetPayload<{
      include: { actorUser: { select: { fullName: true } } };
    }>
  ): AuditLogResponseDto {
    return {
      id: log.id,
      actorUserId: log.actorUserId || undefined,
      actorName: log.actorUser?.fullName || undefined,
      actorRole: log.actorRole || undefined,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      correlationId: log.correlationId || undefined,
      ipMasked: log.ipMasked || undefined,
      metadata: log.metadata as Record<string, unknown> | undefined,
      createdAt: log.createdAt,
    };
  }
}

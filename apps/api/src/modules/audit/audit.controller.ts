import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ResourceType } from '@prisma/client';
import { AuditService } from './services/audit.service';
import { QueryAuditLogsDto, PaginatedAuditLogsResponseDto, AuditLogResponseDto } from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthenticatedUser {
  id: string;
  role: string;
  tenantId?: string;
}

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Query audit logs with filters
   * Admin/Operations only
   */
  @Get()
  @Roles('ADMIN', 'OPERATIONS')
  async queryLogs(
    @Query() dto: QueryAuditLogsDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PaginatedAuditLogsResponseDto> {
    return this.auditService.query(dto, user.tenantId);
  }

  /**
   * Get audit trail for a specific resource
   * Admin/Operations only
   */
  @Get('resource/:resourceType/:resourceId')
  @Roles('ADMIN', 'OPERATIONS')
  async getResourceAuditTrail(
    @Param('resourceType') resourceType: ResourceType,
    @Param('resourceId') resourceId: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<AuditLogResponseDto[]> {
    return this.auditService.getResourceAuditTrail(resourceType, resourceId, user.tenantId);
  }

  /**
   * Get all logs for a correlation ID (trace a request)
   * Admin/Operations only
   */
  @Get('correlation/:correlationId')
  @Roles('ADMIN', 'OPERATIONS')
  async getByCorrelationId(
    @Param('correlationId') correlationId: string
  ): Promise<AuditLogResponseDto[]> {
    return this.auditService.getByCorrelationId(correlationId);
  }

  /**
   * Get recent activity for a user
   * Admin/Operations only
   */
  @Get('user/:userId')
  @Roles('ADMIN', 'OPERATIONS')
  async getUserActivity(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @CurrentUser() user?: AuthenticatedUser
  ): Promise<AuditLogResponseDto[]> {
    return this.auditService.getUserActivity(userId, limit || 50, user?.tenantId);
  }

  /**
   * Get my own activity (any authenticated user)
   */
  @Get('me')
  async getMyActivity(
    @Query('limit') limit?: number,
    @CurrentUser() user?: AuthenticatedUser
  ): Promise<AuditLogResponseDto[]> {
    if (!user) {
      return [];
    }
    return this.auditService.getUserActivity(user.id, limit || 50, user.tenantId);
  }
}

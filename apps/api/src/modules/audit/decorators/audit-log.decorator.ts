import { SetMetadata } from '@nestjs/common';
import { ResourceType } from '@prisma/client';

export const AUDIT_LOG_KEY = 'audit_log';

export interface AuditLogMetadata {
  action: string;
  resourceType: ResourceType;
  /**
   * Path to extract resourceId from request params, body, or result
   * Examples: 'params.id', 'body.appointmentId', 'result.id'
   */
  resourceIdPath?: string;
  /**
   * Additional metadata to include in the audit log
   * Can be a function that receives (request, result) and returns metadata
   */
  metadataExtractor?: (req: unknown, result: unknown) => Record<string, unknown>;
}

/**
 * Decorator to automatically log actions to audit trail
 * @example
 * @AuditLog({
 *   action: AUDIT_ACTIONS.APPOINTMENT_CREATE,
 *   resourceType: 'APPOINTMENT',
 *   resourceIdPath: 'result.id',
 * })
 * async createAppointment(@Body() dto: CreateAppointmentDto) { ... }
 */
export const AuditLog = (metadata: AuditLogMetadata) => SetMetadata(AUDIT_LOG_KEY, metadata);

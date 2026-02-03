// CANNEO - Audit validation schemas (Zod)
import { z } from 'zod';
import { paginationSchema, dateRangeSchema } from './common.schema';

// ==================== RESOURCE TYPE ====================

export const resourceTypeSchema = z.enum([
  'USER',
  'DOCTOR',
  'PATIENT',
  'PHARMACY',
  'APPOINTMENT',
  'PAYMENT_INTENT',
  'WITHDRAWAL',
  'ORDER',
  'SHIPMENT',
  'PRESCRIPTION',
  'DOCUMENT',
  'MEDICAL_RECORD',
]);

// ==================== AUDIT LOG SCHEMAS ====================

export const auditLogQuerySchema = z
  .object({
    resourceType: resourceTypeSchema.optional(),
    resourceId: z.string().cuid().optional(),
    actorUserId: z.string().cuid().optional(),
    action: z.string().max(100).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    correlationId: z.string().uuid().optional(),
  })
  .merge(paginationSchema);

export const createAuditLogSchema = z.object({
  action: z.string().min(1, 'Ação é obrigatória').max(100),
  resourceType: resourceTypeSchema,
  resourceId: z.string().cuid('ID do recurso inválido'),
  metadata: z.record(z.unknown()).optional(),
  correlationId: z.string().uuid().optional(),
});

// ==================== AUDIT ACTIONS ====================

export const auditActionSchema = z.enum([
  // Auth actions
  'AUTH_LOGIN',
  'AUTH_LOGOUT',
  'AUTH_MFA_SETUP',
  'AUTH_MFA_VERIFY',
  'AUTH_PASSWORD_CHANGE',
  'AUTH_PASSWORD_RESET',
  'AUTH_SESSION_REVOKE',

  // User actions
  'USER_CREATE',
  'USER_UPDATE',
  'USER_DELETE',
  'USER_STATUS_CHANGE',

  // Doctor actions
  'DOCTOR_VERIFY',
  'DOCTOR_REJECT',
  'DOCTOR_PROFILE_UPDATE',

  // Patient actions
  'PATIENT_PROFILE_UPDATE',

  // Appointment actions
  'APPOINTMENT_CREATE',
  'APPOINTMENT_CONFIRM',
  'APPOINTMENT_START',
  'APPOINTMENT_COMPLETE',
  'APPOINTMENT_CANCEL',
  'APPOINTMENT_REFUND',

  // Payment actions
  'PAYMENT_INTENT_CREATE',
  'PAYMENT_ATTEMPT',
  'PAYMENT_APPROVED',
  'PAYMENT_FAILED',
  'PAYMENT_REFUND',
  'PAYMENT_CHARGEBACK',

  // Withdrawal actions
  'WITHDRAWAL_REQUEST',
  'WITHDRAWAL_VALIDATE',
  'WITHDRAWAL_SCHEDULE',
  'WITHDRAWAL_PROCESS',
  'WITHDRAWAL_COMPLETE',
  'WITHDRAWAL_FAIL',
  'WITHDRAWAL_CANCEL',

  // Medical record actions
  'RECORD_VIEW',
  'RECORD_ENTRY_CREATE',
  'DOCUMENT_VIEW',
  'DOCUMENT_UPLOAD',
  'DOCUMENT_SIGN',

  // Prescription actions
  'PRESCRIPTION_CREATE',
  'PRESCRIPTION_UPDATE',
  'PRESCRIPTION_SIGN',
  'PRESCRIPTION_SNCR_REGISTER',
  'PRESCRIPTION_CANCEL',

  // Telehealth actions
  'VIDEO_SESSION_JOIN',
  'VIDEO_SESSION_LEAVE',
  'VIDEO_RECORDING_START',
  'VIDEO_RECORDING_STOP',
  'VIDEO_TRANSCRIPTION_START',

  // Order actions
  'ORDER_CREATE',
  'ORDER_PAYMENT',
  'ORDER_PROCESS',
  'ORDER_SHIP',
  'ORDER_DELIVER',
  'ORDER_CANCEL',
  'ORDER_REFUND',

  // Pharmacy actions
  'PHARMACY_CREATE',
  'PHARMACY_UPDATE',
  'INVENTORY_UPDATE',

  // Consent actions
  'CONSENT_ACCEPT',
  'CONSENT_REVOKE',
]);

// Type exports
export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
export type CreateAuditLog = z.infer<typeof createAuditLogSchema>;
export type AuditAction = z.infer<typeof auditActionSchema>;

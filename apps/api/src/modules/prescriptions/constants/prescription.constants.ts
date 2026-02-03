/**
 * Prescription Status Flow:
 * DRAFT → SIGNED → SNCR_REGISTERED
 */
export const PRESCRIPTION_STATUS = {
  DRAFT: 'DRAFT',
  SIGNED: 'SIGNED',
  SNCR_REGISTERED: 'SNCR_REGISTERED',
} as const;

export type PrescriptionStatus = (typeof PRESCRIPTION_STATUS)[keyof typeof PRESCRIPTION_STATUS];

/**
 * SNCR Status (Sistema Nacional de Controle de Receituário)
 */
export const SNCR_STATUS = {
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type SncrStatus = (typeof SNCR_STATUS)[keyof typeof SNCR_STATUS];

/**
 * Valid status transitions
 */
export const VALID_TRANSITIONS: Record<PrescriptionStatus, PrescriptionStatus[]> = {
  [PRESCRIPTION_STATUS.DRAFT]: [PRESCRIPTION_STATUS.SIGNED],
  [PRESCRIPTION_STATUS.SIGNED]: [PRESCRIPTION_STATUS.SNCR_REGISTERED],
  [PRESCRIPTION_STATUS.SNCR_REGISTERED]: [],
};

/**
 * Appointment statuses that allow prescription creation
 */
export const COMPLETED_APPOINTMENT_STATUSES = ['COMPLETED'] as const;

/**
 * PDF document type
 */
export const PRESCRIPTION_DOCUMENT_TYPE = 'PRESCRIPTION';

/**
 * Storage folder for prescriptions
 */
export const PRESCRIPTIONS_STORAGE_FOLDER = 'prescriptions';

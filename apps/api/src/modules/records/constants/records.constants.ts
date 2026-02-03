/**
 * Record Entry Types
 */
export const RECORD_ENTRY_TYPES = {
  EVOLUTION: 'EVOLUTION',
  ANAMNESIS: 'ANAMNESIS',
  PHYSICAL_EXAM: 'PHYSICAL_EXAM',
  DIAGNOSIS: 'DIAGNOSIS',
  TREATMENT_PLAN: 'TREATMENT_PLAN',
  NOTE: 'NOTE',
  DISCHARGE: 'DISCHARGE',
} as const;

export type RecordEntryType = (typeof RECORD_ENTRY_TYPES)[keyof typeof RECORD_ENTRY_TYPES];

/**
 * Document Types
 */
export const DOCUMENT_TYPES = {
  PRESCRIPTION: 'PRESCRIPTION',
  MEDICAL_CERTIFICATE: 'MEDICAL_CERTIFICATE',
  LAB_RESULT: 'LAB_RESULT',
  IMAGING: 'IMAGING',
  REPORT: 'REPORT',
  CONSENT_FORM: 'CONSENT_FORM',
  REFERRAL: 'REFERRAL',
  OTHER: 'OTHER',
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

/**
 * Signed URL TTL in seconds (5 minutes)
 */
export const SIGNED_URL_TTL_SECONDS = 300;

/**
 * Max file size for uploads (10MB)
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Allowed MIME types for document uploads
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/**
 * Storage folders
 */
export const STORAGE_FOLDERS = {
  DOCUMENTS: 'documents',
  PRESCRIPTIONS: 'prescriptions',
  MEDICAL_RECORDS: 'medical-records',
} as const;

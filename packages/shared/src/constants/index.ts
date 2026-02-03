// @canneo/shared - Constants

// ==================== FINANCIAL CONSTANTS ====================

/**
 * All monetary values are in CENTAVOS (1/100 of BRL)
 */
export const CURRENCY = 'BRL';

/**
 * Anti-fraud hold windows (in days)
 * Funds are held before becoming available for withdrawal
 */
export const ANTIFRAUD_HOLD_DAYS = {
  PIX: 1, // D+1
  CARD_CREDIT: 7, // D+7
  CARD_DEBIT: 2, // D+2
} as const;

/**
 * Minimum withdrawal amount in centavos (R$ 10,00)
 */
export const MIN_WITHDRAWAL_CENTS = 1000;

/**
 * Fee rates in basis points (1 bp = 0.01%)
 */
export const DEFAULT_FEE_RATES = {
  GATEWAY_RATE_BPS: 249, // 2.49%
  GATEWAY_FIXED_CENTS: 0,
  CANNEO_RATE_BPS: 1500, // 15% (charged on net after gateway)
} as const;

// ==================== SCHEDULING CONSTANTS ====================

/**
 * Default appointment duration in minutes
 */
export const DEFAULT_APPOINTMENT_DURATION_MINUTES = 30;

/**
 * Maximum advance booking days
 */
export const MAX_ADVANCE_BOOKING_DAYS = 90;

/**
 * Minimum advance booking hours
 */
export const MIN_ADVANCE_BOOKING_HOURS = 2;

/**
 * Payment expiration for pending appointments (in minutes)
 */
export const PAYMENT_EXPIRATION_MINUTES = 30;

// ==================== TELEHEALTH CONSTANTS ====================

/**
 * Video provider
 */
export const VIDEO_PROVIDER = 'DAILY';

/**
 * Token expiration for video sessions (in seconds)
 */
export const VIDEO_TOKEN_EXPIRATION_SECONDS = 3600; // 1 hour

/**
 * Maximum video session duration (in minutes)
 */
export const MAX_VIDEO_SESSION_DURATION_MINUTES = 120;

// ==================== PHARMACY CONSTANTS ====================

/**
 * Shipping provider
 */
export const SHIPPING_PROVIDER = 'MELHOR_ENVIO';

/**
 * Maximum search radius in km
 */
export const MAX_PHARMACY_SEARCH_RADIUS_KM = 500;

/**
 * Default SLA for pharmacy fulfillment (in minutes)
 */
export const DEFAULT_PHARMACY_SLA_MINUTES = 180;

// ==================== AUTH CONSTANTS ====================

/**
 * Access token expiration (in seconds)
 */
export const ACCESS_TOKEN_EXPIRATION_SECONDS = 900; // 15 minutes

/**
 * Refresh token expiration (in seconds)
 */
export const REFRESH_TOKEN_EXPIRATION_SECONDS = 604800; // 7 days

/**
 * Step-up authentication validity (in seconds)
 */
export const STEP_UP_VALIDITY_SECONDS = 300; // 5 minutes

/**
 * MFA code expiration (in seconds)
 */
export const MFA_CODE_EXPIRATION_SECONDS = 300; // 5 minutes

/**
 * Maximum login attempts before lockout
 */
export const MAX_LOGIN_ATTEMPTS = 5;

/**
 * Lockout duration (in seconds)
 */
export const LOCKOUT_DURATION_SECONDS = 900; // 15 minutes

/**
 * Roles that require MFA
 */
export const MFA_REQUIRED_ROLES = ['ADMIN', 'DOCTOR'] as const;

// ==================== RATE LIMITING ====================

export const RATE_LIMITS = {
  LOGIN: { windowMs: 60000, maxRequests: 5 },
  API_SHORT: { windowMs: 1000, maxRequests: 10 },
  API_MEDIUM: { windowMs: 10000, maxRequests: 50 },
  API_LONG: { windowMs: 60000, maxRequests: 100 },
  WEBHOOK: { windowMs: 1000, maxRequests: 100 },
} as const;

// ==================== FILE UPLOAD ====================

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

// ==================== PAGINATION ====================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ==================== BRAZILIAN STATES ====================

export const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

// ==================== PORTAL URLS ====================

export const PORTAL_URLS = {
  ADMIN: 'adm.canneo.com.br',
  DOCTOR: 'medico.canneo.com.br',
  PATIENT: 'web.canneo.com.br',
  PHARMACY: 'farma.canneo.com.br',
} as const;

// ==================== WEBHOOK PROVIDERS ====================

export const WEBHOOK_PROVIDERS = {
  PSP: 'PSP',
  DAILY: 'DAILY',
  MELHOR_ENVIO: 'MELHOR_ENVIO',
} as const;

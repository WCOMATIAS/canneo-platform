export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY: '15m',
  ACCESS_TOKEN_EXPIRY_MS: 15 * 60 * 1000,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000,
  STEP_UP_TOKEN_EXPIRY: '5m',
  STEP_UP_TOKEN_EXPIRY_MS: 5 * 60 * 1000,
  MFA_WINDOW: 1,
  BCRYPT_ROUNDS: 12,
  COOKIE_ACCESS_TOKEN: 'canneo_access',
  COOKIE_REFRESH_TOKEN: 'canneo_refresh',
  COOKIE_STEP_UP_TOKEN: 'canneo_stepup',
} as const;

export const ROLES_KEY = 'roles';
export const MFA_REQUIRED_KEY = 'mfa_required';
export const STEP_UP_KEY = 'step_up_required';
export const PUBLIC_KEY = 'isPublic';

export const STEP_UP_ACTIONS = [
  'withdrawal',
  'bank_account',
  'export_data',
  'delete_account',
  'change_email',
  'change_password',
] as const;

export type StepUpAction = (typeof STEP_UP_ACTIONS)[number];

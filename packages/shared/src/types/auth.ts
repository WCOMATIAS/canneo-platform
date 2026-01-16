// ============================================================================
// AUTH TYPES
// ============================================================================

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  crm: string;
  ufCrm: string;
  phone?: string;
  specialty?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyMfaDto {
  code: string;
  tempToken: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthResponse {
  user: UserDto;
  organization: OrganizationDto | null;
  subscription: SubscriptionDto | null;
  accessToken: string;
  refreshToken: string;
}

export interface MfaRequiredResponse {
  requiresMfa: true;
  tempToken: string;
  message: string;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  role?: string;
}

export interface SubscriptionDto {
  status: SubscriptionStatus;
  trialEndsAt: Date | null;
}

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';

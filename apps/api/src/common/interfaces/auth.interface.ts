import { UserRole, UserStatus } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  mfaVerified: boolean;
  iat?: number;
  exp?: number;
}

export interface StepUpPayload {
  sub: string;
  action: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  fullName: string;
  tenantId?: string;
  mfaVerified: boolean;
  mfaEnabled: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Omit<AuthenticatedUser, 'mfaVerified'>;
  requiresMfa: boolean;
  mfaEnabled: boolean;
  mfaSetupRequired?: boolean;
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes?: string[];
}

export interface SessionInfo {
  id: string;
  deviceHash?: string;
  ipMasked?: string;
  createdAt: Date;
  lastAccessAt: Date;
}

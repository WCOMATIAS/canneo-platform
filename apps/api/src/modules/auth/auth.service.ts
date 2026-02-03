import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus, MfaType } from '@prisma/client';
import { authenticator } from 'otplib';
import { PrismaService } from '../prisma/prisma.service';
import {
  JwtPayload,
  TokenPair,
  AuthResponse,
  AuthenticatedUser,
  MfaSetupResponse,
  StepUpPayload,
} from '../../common/interfaces/auth.interface';
import { AUTH_CONSTANTS, StepUpAction } from '../../common/constants/auth.constants';
import {
  hashToken,
  verifyPassword,
  generateSecureToken,
  maskIp,
  hashUserAgent,
  hashDevice,
  encryptData,
  decryptData,
} from '../../common/utils/crypto.util';
import { LoginDto } from './dto';

// MFA temporariamente desabilitado para todos os roles
// const ROLES_REQUIRING_MFA = [UserRole.ADMIN, UserRole.DOCTOR];
const ROLES_REQUIRING_MFA: UserRole[] = [];

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    authenticator.options = {
      window: AUTH_CONSTANTS.MFA_WINDOW,
    };
  }

  async login(
    dto: LoginDto,
    ip: string,
    userAgent: string,
  ): Promise<{ authResponse: AuthResponse; tokens?: TokenPair }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        mfaSecrets: {
          where: { enabledAt: { not: null } },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Conta suspensa ou inativa');
    }

    const isPasswordValid = await verifyPassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed for user: ${user.email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const mfaEnabled = user.mfaSecrets.length > 0;
    const roleRequiresMfa = ROLES_REQUIRING_MFA.includes(user.role);

    if (roleRequiresMfa && !mfaEnabled) {
      return {
        authResponse: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            fullName: user.fullName,
            tenantId: user.tenantId ?? undefined,
            mfaEnabled: false,
          },
          requiresMfa: false,
          mfaEnabled: false,
          mfaSetupRequired: true,
        },
      };
    }

    if (mfaEnabled) {
      if (!dto.mfaCode) {
        return {
          authResponse: {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              status: user.status,
              fullName: user.fullName,
              tenantId: user.tenantId ?? undefined,
              mfaEnabled: true,
            },
            requiresMfa: true,
            mfaEnabled: true,
          },
        };
      }

      const mfaSecret = user.mfaSecrets[0];
      const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY')!;
      const secret = decryptData(mfaSecret.secretEnc, encryptionKey);

      const isValidMfa = authenticator.verify({
        token: dto.mfaCode,
        secret,
      });

      if (!isValidMfa) {
        throw new UnauthorizedException('Código MFA inválido');
      }
    }

    const tokens = await this.createSession(user.id, mfaEnabled, ip, userAgent);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`User logged in: ${user.email}`);

    return {
      authResponse: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          fullName: user.fullName,
          tenantId: user.tenantId ?? undefined,
          mfaEnabled,
        },
        requiresMfa: false,
        mfaEnabled,
      },
      tokens,
    };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const refreshTokenHash = hashToken(refreshToken);

    await this.prisma.session.updateMany({
      where: {
        userId,
        refreshTokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    this.logger.log(`User logged out: ${userId}`);
  }

  async logoutAllSessions(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    this.logger.log(`All sessions revoked for user: ${userId}`);
  }

  async refreshTokens(
    refreshToken: string,
    ip: string,
    userAgent: string,
  ): Promise<TokenPair> {
    const refreshTokenHash = hashToken(refreshToken);

    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash,
        revokedAt: null,
        refreshExpiresAt: { gt: new Date() },
      },
      include: {
        user: {
          include: {
            mfaSecrets: {
              where: { enabledAt: { not: null } },
            },
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    if (session.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Conta suspensa ou inativa');
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const mfaEnabled = session.user.mfaSecrets.length > 0;
    return this.createSession(session.userId, mfaEnabled, ip, userAgent);
  }

  async setupMfa(userId: string): Promise<MfaSetupResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        mfaSecrets: {
          where: { enabledAt: { not: null } },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.mfaSecrets.length > 0) {
      throw new BadRequestException('MFA já está configurado');
    }

    const secret = authenticator.generateSecret();
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY')!;
    const secretEnc = encryptData(secret, encryptionKey);

    await this.prisma.mfaSecret.create({
      data: {
        userId,
        type: MfaType.TOTP,
        secretEnc,
      },
    });

    const issuer = 'CANNEO';
    const qrCodeUrl = authenticator.keyuri(user.email, issuer, secret);

    this.logger.log(`MFA setup initiated for user: ${user.email}`);

    return {
      secret,
      qrCodeUrl,
    };
  }

  async verifyAndEnableMfa(userId: string, code: string): Promise<boolean> {
    const mfaSecret = await this.prisma.mfaSecret.findFirst({
      where: {
        userId,
        type: MfaType.TOTP,
        enabledAt: null,
      },
    });

    if (!mfaSecret) {
      throw new BadRequestException('Nenhum MFA pendente de verificação');
    }

    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY')!;
    const secret = decryptData(mfaSecret.secretEnc, encryptionKey);

    const isValid = authenticator.verify({
      token: code,
      secret,
    });

    if (!isValid) {
      throw new BadRequestException('Código MFA inválido');
    }

    await this.prisma.mfaSecret.update({
      where: { id: mfaSecret.id },
      data: {
        enabledAt: new Date(),
        verifiedAt: new Date(),
      },
    });

    this.logger.log(`MFA enabled for user: ${userId}`);
    return true;
  }

  async verifyMfaForExistingUser(userId: string, code: string): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        mfaSecrets: {
          where: { enabledAt: { not: null } },
        },
      },
    });

    if (!user || user.mfaSecrets.length === 0) {
      throw new BadRequestException('MFA não configurado');
    }

    const mfaSecret = user.mfaSecrets[0];
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY')!;
    const secret = decryptData(mfaSecret.secretEnc, encryptionKey);

    const isValid = authenticator.verify({
      token: code,
      secret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Código MFA inválido');
    }

    return this.createSession(userId, true, '', '');
  }

  async createStepUpToken(
    userId: string,
    action: StepUpAction,
    mfaCode: string,
  ): Promise<{ token: string; expiresAt: number }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        mfaSecrets: {
          where: { enabledAt: { not: null } },
        },
      },
    });

    if (!user || user.mfaSecrets.length === 0) {
      throw new ForbiddenException('MFA necessário para step-up authentication');
    }

    const mfaSecret = user.mfaSecrets[0];
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY')!;
    const secret = decryptData(mfaSecret.secretEnc, encryptionKey);

    const isValid = authenticator.verify({
      token: mfaCode,
      secret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Código MFA inválido');
    }

    const payload: StepUpPayload = {
      sub: userId,
      action,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: AUTH_CONSTANTS.STEP_UP_TOKEN_EXPIRY,
    });

    const expiresAt = Math.floor(
      (Date.now() + AUTH_CONSTANTS.STEP_UP_TOKEN_EXPIRY_MS) / 1000,
    );

    this.logger.log(`Step-up token created for user ${userId}, action: ${action}`);

    return { token, expiresAt };
  }

  async getCurrentUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        mfaSecrets: {
          where: { enabledAt: { not: null } },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      fullName: user.fullName,
      tenantId: user.tenantId ?? undefined,
      mfaVerified: true,
      mfaEnabled: user.mfaSecrets.length > 0,
    };
  }

  private async createSession(
    userId: string,
    mfaVerified: boolean,
    ip: string,
    userAgent: string,
  ): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId ?? undefined,
      mfaVerified,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = generateSecureToken(64);
    const refreshTokenHash = hashToken(refreshToken);

    const refreshExpiresAt = new Date(
      Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS,
    );

    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        refreshExpiresAt,
        deviceHash: hashDevice(ip, userAgent),
        ipMasked: maskIp(ip),
        userAgentHash: hashUserAgent(userAgent),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  getCookieOptions(isProduction: boolean) {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' as const : 'lax' as const,
      path: '/',
      domain: isProduction ? '.canneo.com.br' : undefined,
    };
  }

  getAccessTokenCookieOptions(isProduction: boolean) {
    return {
      ...this.getCookieOptions(isProduction),
      maxAge: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY_MS,
    };
  }

  getRefreshTokenCookieOptions(isProduction: boolean) {
    return {
      ...this.getCookieOptions(isProduction),
      maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS,
      path: '/auth/refresh',
    };
  }

  getStepUpTokenCookieOptions(isProduction: boolean) {
    return {
      ...this.getCookieOptions(isProduction),
      maxAge: AUTH_CONSTANTS.STEP_UP_TOKEN_EXPIRY_MS,
    };
  }

  getClearCookieOptions() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' as const : 'lax' as const,
      path: '/',
      domain: isProduction ? '.canneo.com.br' : undefined,
    };
  }
}

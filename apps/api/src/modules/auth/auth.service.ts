import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { RegisterDto, LoginDto, VerifyMfaDto, RefreshTokenDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private cryptoUtil: CryptoUtil,
  ) {}

  // ============================================================================
  // REGISTER
  // ============================================================================

  async register(dto: RegisterDto) {
    // Verifica se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    // Verifica se CRM já existe
    const existingDoctor = await this.prisma.doctorProfile.findUnique({
      where: {
        crm_ufCrm: {
          crm: dto.crm,
          ufCrm: dto.ufCrm.toUpperCase(),
        },
      },
    });

    if (existingDoctor) {
      throw new ConflictException('CRM já cadastrado');
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Cria tudo em uma transação
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Criar User
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name,
          phone: dto.phone,
        },
      });

      // 2. Criar DoctorProfile
      const doctorProfile = await tx.doctorProfile.create({
        data: {
          userId: user.id,
          crm: dto.crm,
          ufCrm: dto.ufCrm.toUpperCase(),
          specialty: dto.specialty,
        },
      });

      // 3. Criar Organization (tipo CLINICA solo)
      const slug = this.generateSlug(dto.name);
      const organization = await tx.organization.create({
        data: {
          name: `Consultório ${dto.name}`,
          slug,
          type: 'CLINICA',
        },
      });

      // 4. Criar Membership (OWNER)
      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'OWNER',
          joinedAt: new Date(),
        },
      });

      // 5. Buscar plano SOLO
      const plan = await tx.plan.findFirst({
        where: { name: 'SOLO', isActive: true },
      });

      if (!plan) {
        throw new BadRequestException('Plano SOLO não encontrado. Execute o seed.');
      }

      // 6. Criar Subscription (TRIAL de 7 dias)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      const subscription = await tx.subscription.create({
        data: {
          organizationId: organization.id,
          planId: plan.id,
          status: 'TRIAL',
          trialEndsAt,
        },
      });

      // 7. Gerar código de verificação de email
      const verificationCode = this.cryptoUtil.generateOtp(6);
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      await tx.otpCode.create({
        data: {
          userId: user.id,
          code: verificationCode,
          type: 'EMAIL_VERIFY',
          expiresAt,
        },
      });

      return {
        user,
        doctorProfile,
        organization,
        membership,
        subscription,
        verificationCode,
      };
    });

    // TODO: Enviar email de verificação
    this.logger.log(`Verification code for ${dto.email}: ${result.verificationCode}`);

    // Gera tokens
    const tokens = await this.generateTokens(result.user.id, result.user.email);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        emailVerified: result.user.emailVerified,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
      },
      subscription: {
        status: result.subscription.status,
        trialEndsAt: result.subscription.trialEndsAt,
      },
      ...tokens,
    };
  }

  // ============================================================================
  // LOGIN
  // ============================================================================

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            organization: {
              include: {
                subscriptions: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Atualiza último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Verifica se MFA está habilitado
    if (user.mfaEnabled) {
      // Gera token temporário
      const tempToken = this.jwtService.sign(
        { sub: user.id, email: user.email, type: 'temp' },
        { expiresIn: '5m' },
      );

      // Gera e envia código OTP
      const otpCode = this.cryptoUtil.generateOtp(6);
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      await this.prisma.otpCode.create({
        data: {
          userId: user.id,
          code: otpCode,
          type: 'MFA',
          expiresAt,
        },
      });

      // TODO: Enviar email com código
      this.logger.log(`MFA code for ${user.email}: ${otpCode}`);

      return {
        requiresMfa: true,
        tempToken,
        message: 'Código de verificação enviado para seu email',
      };
    }

    // Login direto (sem MFA)
    const tokens = await this.generateTokens(user.id, user.email);

    // Pega primeira organização (para retornar no login)
    const firstMembership = user.memberships[0];
    const organization = firstMembership?.organization;
    const subscription = organization?.subscriptions[0];

    return {
      requiresMfa: false,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
      organization: organization
        ? {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            role: firstMembership.role,
          }
        : null,
      subscription: subscription
        ? {
            status: subscription.status,
            trialEndsAt: subscription.trialEndsAt,
          }
        : null,
      ...tokens,
    };
  }

  // ============================================================================
  // VERIFY MFA
  // ============================================================================

  async verifyMfa(dto: VerifyMfaDto) {
    // Decodifica token temporário
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(dto.tempToken);
    } catch {
      throw new UnauthorizedException('Token expirado. Faça login novamente.');
    }

    if (payload.type !== 'temp') {
      throw new UnauthorizedException('Token inválido');
    }

    // Busca código OTP
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        userId: payload.sub,
        type: 'MFA',
        code: dto.code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Código inválido ou expirado');
    }

    // Marca como usado
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    // Busca user com orgs
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            organization: {
              include: {
                subscriptions: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Gera tokens
    const tokens = await this.generateTokens(user.id, user.email);

    const firstMembership = user.memberships[0];
    const organization = firstMembership?.organization;
    const subscription = organization?.subscriptions[0];

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
      organization: organization
        ? {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            role: firstMembership.role,
          }
        : null,
      subscription: subscription
        ? {
            status: subscription.status,
            trialEndsAt: subscription.trialEndsAt,
          }
        : null,
      ...tokens,
    };
  }

  // ============================================================================
  // REFRESH TOKEN
  // ============================================================================

  async refreshToken(dto: RefreshTokenDto) {
    // Busca refresh token
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (tokenRecord.revokedAt) {
      throw new UnauthorizedException('Refresh token revogado');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    // Revoga token atual
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    // Gera novos tokens
    return this.generateTokens(tokenRecord.user.id, tokenRecord.user.email);
  }

  // ============================================================================
  // GET ME - Retorna usuário autenticado com membership e doctorProfile
  // ============================================================================

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: true,
        memberships: {
          where: { isActive: true },
          include: {
            organization: {
              include: {
                subscriptions: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const firstMembership = user.memberships[0];
    const organization = firstMembership?.organization;
    const subscription = organization?.subscriptions[0];

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mfaEnabled: user.mfaEnabled,
        emailVerified: user.emailVerified,
      },
      organization: organization
        ? {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            type: organization.type,
            role: firstMembership.role,
          }
        : null,
      doctorProfile: user.doctorProfile
        ? {
            id: user.doctorProfile.id,
            name: user.name,
            crm: user.doctorProfile.crm,
            ufCrm: user.doctorProfile.ufCrm,
            specialty: user.doctorProfile.specialty,
          }
        : null,
      subscription: subscription
        ? {
            status: subscription.status,
            trialEndsAt: subscription.trialEndsAt,
          }
        : null,
    };
  }

  // ============================================================================
  // LOGOUT
  // ============================================================================

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // Revoga refresh token específico
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          token: refreshToken,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    } else {
      // Revoga todos os refresh tokens do usuário
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    }

    return { message: 'Logout realizado com sucesso' };
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private async generateTokens(userId: string, email: string) {
    const payload: JwtPayload = { sub: userId, email, type: 'access' };

    const accessToken = this.jwtService.sign(payload);

    // Gera refresh token
    const refreshToken = this.cryptoUtil.generateToken(64);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
      .replace(/^-+|-+$/g, ''); // Remove hífens do início/fim

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${randomSuffix}`;
  }
}

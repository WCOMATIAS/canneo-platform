import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard, RolesGuard, MfaGuard } from './guards';
import { Public, CurrentUser } from './decorators';
import { LoginDto, LoginResponseDto, MfaSetupResponseDto, MfaVerifyDto, MfaVerifyResponseDto, StepUpRequestDto, StepUpResponseDto } from './dto';
import { AuthenticatedUser } from '../../common/interfaces/auth.interface';
import { AUTH_CONSTANTS } from '../../common/constants/auth.constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const { authResponse, tokens } = await this.authService.login(dto, ip, userAgent);

    if (tokens) {
      res.cookie(
        AUTH_CONSTANTS.COOKIE_ACCESS_TOKEN,
        tokens.accessToken,
        this.authService.getAccessTokenCookieOptions(this.isProduction),
      );

      res.cookie(
        AUTH_CONSTANTS.COOKIE_REFRESH_TOKEN,
        tokens.refreshToken,
        this.authService.getRefreshTokenCookieOptions(this.isProduction),
      );
    }

    return {
      user: {
        id: authResponse.user.id,
        email: authResponse.user.email,
        fullName: authResponse.user.fullName,
        role: authResponse.user.role,
        tenantId: authResponse.user.tenantId,
      },
      requiresMfa: authResponse.requiresMfa,
      mfaEnabled: authResponse.mfaEnabled,
      mfaSetupRequired: authResponse.mfaSetupRequired,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Logout do usuário' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  async logout(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const refreshToken = req.cookies?.[AUTH_CONSTANTS.COOKIE_REFRESH_TOKEN];

    if (refreshToken) {
      await this.authService.logout(userId, refreshToken);
    }

    res.clearCookie(AUTH_CONSTANTS.COOKIE_ACCESS_TOKEN, {
      ...this.authService.getClearCookieOptions(),
    });

    res.clearCookie(AUTH_CONSTANTS.COOKIE_REFRESH_TOKEN, {
      ...this.authService.getClearCookieOptions(),
      path: '/auth/refresh',
    });

    res.clearCookie(AUTH_CONSTANTS.COOKIE_STEP_UP_TOKEN, {
      ...this.authService.getClearCookieOptions(),
    });

    return { message: 'Logout realizado com sucesso' };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar tokens de acesso' })
  @ApiResponse({ status: 200, description: 'Tokens renovados com sucesso' })
  @ApiResponse({ status: 401, description: 'Sessão inválida ou expirada' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const refreshToken = req.cookies?.[AUTH_CONSTANTS.COOKIE_REFRESH_TOKEN];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const tokens = await this.authService.refreshTokens(refreshToken, ip, userAgent);

    res.cookie(
      AUTH_CONSTANTS.COOKIE_ACCESS_TOKEN,
      tokens.accessToken,
      this.authService.getAccessTokenCookieOptions(this.isProduction),
    );

    res.cookie(
      AUTH_CONSTANTS.COOKIE_REFRESH_TOKEN,
      tokens.refreshToken,
      this.authService.getRefreshTokenCookieOptions(this.isProduction),
    );

    return { message: 'Tokens renovados com sucesso' };
  }

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Iniciar configuração de MFA' })
  @ApiResponse({ status: 200, description: 'Setup MFA iniciado', type: MfaSetupResponseDto })
  @ApiResponse({ status: 400, description: 'MFA já configurado' })
  async setupMfa(
    @CurrentUser('id') userId: string,
  ): Promise<MfaSetupResponseDto> {
    return this.authService.setupMfa(userId);
  }

  @Post('mfa/verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Verificar e ativar MFA' })
  @ApiResponse({ status: 200, description: 'MFA verificado e ativado', type: MfaVerifyResponseDto })
  @ApiResponse({ status: 400, description: 'Código MFA inválido' })
  async verifyMfa(
    @CurrentUser('id') userId: string,
    @Body() dto: MfaVerifyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MfaVerifyResponseDto> {
    await this.authService.verifyAndEnableMfa(userId, dto.code);

    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const tokens = await this.authService.verifyMfaForExistingUser(userId, dto.code);

    res.cookie(
      AUTH_CONSTANTS.COOKIE_ACCESS_TOKEN,
      tokens.accessToken,
      this.authService.getAccessTokenCookieOptions(this.isProduction),
    );

    res.cookie(
      AUTH_CONSTANTS.COOKIE_REFRESH_TOKEN,
      tokens.refreshToken,
      this.authService.getRefreshTokenCookieOptions(this.isProduction),
    );

    return {
      verified: true,
      message: 'MFA verificado e ativado com sucesso',
    };
  }

  @Post('step-up')
  @UseGuards(JwtAuthGuard, MfaGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Solicitar autenticação elevada (step-up)' })
  @ApiResponse({ status: 200, description: 'Step-up autorizado', type: StepUpResponseDto })
  @ApiResponse({ status: 401, description: 'Código MFA inválido' })
  @ApiResponse({ status: 403, description: 'MFA obrigatório' })
  async stepUp(
    @CurrentUser('id') userId: string,
    @Body() dto: StepUpRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StepUpResponseDto> {
    const { token, expiresAt } = await this.authService.createStepUpToken(
      userId,
      dto.action,
      dto.mfaCode,
    );

    res.cookie(
      AUTH_CONSTANTS.COOKIE_STEP_UP_TOKEN,
      token,
      this.authService.getStepUpTokenCookieOptions(this.isProduction),
    );

    return {
      success: true,
      action: dto.action,
      expiresAt,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard, MfaGuard)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async me(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Omit<AuthenticatedUser, 'mfaVerified'>> {
    const currentUser = await this.authService.getCurrentUser(user.id);

    return {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
      status: currentUser.status,
      fullName: currentUser.fullName,
      tenantId: currentUser.tenantId,
      mfaEnabled: currentUser.mfaEnabled,
    };
  }
}

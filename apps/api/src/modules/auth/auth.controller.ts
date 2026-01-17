import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  VerifyMfaDto,
  RefreshTokenDto,
} from './dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registra novo médico
   * Cria: User + DoctorProfile + Organization + Membership + Subscription (TRIAL)
   */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Login
   * Se MFA habilitado, retorna tempToken e envia código por email
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Verifica código MFA
   */
  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(@Body() dto: VerifyMfaDto) {
    return this.authService.verifyMfa(dto);
  }

  /**
   * Renova access token usando refresh token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  /**
   * Logout - revoga refresh tokens
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: CurrentUserData,
    @Body('refreshToken') refreshToken?: string,
  ) {
    return this.authService.logout(user.userId, refreshToken);
  }

  /**
   * Retorna usuário autenticado com membership e doctorProfile
   */
  @Get('me')
  async me(@CurrentUser() user: CurrentUserData) {
    return this.authService.getMe(user.userId);
  }
}

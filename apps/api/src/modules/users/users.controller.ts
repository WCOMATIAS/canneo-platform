import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Retorna perfil do usuário autenticado
   */
  @Get('me')
  async getMe(@CurrentUser() user: CurrentUserData) {
    return this.usersService.findById(user.userId);
  }

  /**
   * Atualiza perfil do usuário
   */
  @Patch('me')
  async updateMe(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { name?: string; phone?: string; avatarUrl?: string },
  ) {
    return this.usersService.update(user.userId, body);
  }

  /**
   * Atualiza perfil médico
   */
  @Patch('me/doctor-profile')
  async updateDoctorProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { specialty?: string; bio?: string; signatureUrl?: string },
  ) {
    return this.usersService.updateDoctorProfile(user.userId, body);
  }

  /**
   * Altera senha
   */
  @Post('me/change-password')
  async changePassword(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(
      user.userId,
      body.currentPassword,
      body.newPassword,
    );
  }

  /**
   * Habilita MFA
   */
  @Post('me/mfa/enable')
  async enableMfa(@CurrentUser() user: CurrentUserData) {
    return this.usersService.enableMfa(user.userId);
  }

  /**
   * Desabilita MFA
   */
  @Post('me/mfa/disable')
  async disableMfa(@CurrentUser() user: CurrentUserData) {
    return this.usersService.disableMfa(user.userId);
  }
}

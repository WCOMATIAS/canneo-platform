import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { MembershipRole } from '@prisma/client';

@Controller('organizations')
@UseGuards(TenantGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   * Retorna organização atual (baseado no header x-org-id)
   */
  @Get('current')
  async getCurrent(@Req() req: any) {
    return this.organizationsService.findById(req.organizationId);
  }

  /**
   * Atualiza organização atual
   */
  @Patch('current')
  @Roles('OWNER', 'ADMIN')
  async updateCurrent(
    @Req() req: any,
    @Body() body: { name?: string; logo?: string; settings?: any },
  ) {
    return this.organizationsService.update(req.organizationId, body);
  }

  /**
   * Lista membros da organização
   */
  @Get('current/members')
  async getMembers(@Req() req: any) {
    return this.organizationsService.getMembers(req.organizationId);
  }

  /**
   * Convida novo membro
   */
  @Post('current/members')
  @Roles('OWNER', 'ADMIN')
  async inviteMember(
    @Req() req: any,
    @CurrentUser() user: CurrentUserData,
    @Body() body: { email: string; role: MembershipRole },
  ) {
    return this.organizationsService.inviteMember(
      req.organizationId,
      body.email,
      body.role,
      user.userId,
    );
  }

  /**
   * Atualiza cargo de um membro
   */
  @Patch('current/members/:memberId')
  @Roles('OWNER', 'ADMIN')
  async updateMemberRole(
    @Req() req: any,
    @Param('memberId') memberId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() body: { role: MembershipRole },
  ) {
    return this.organizationsService.updateMemberRole(
      req.organizationId,
      memberId,
      body.role,
      user.userId,
    );
  }

  /**
   * Remove membro da organização
   */
  @Delete('current/members/:memberId')
  @Roles('OWNER', 'ADMIN')
  async removeMember(
    @Req() req: any,
    @Param('memberId') memberId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.organizationsService.removeMember(
      req.organizationId,
      memberId,
      user.userId,
    );
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verifica se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    // Pega o organizationId do header ou do body
    const orgId = request.headers['x-org-id'] || request.body?.organizationId;

    if (!orgId) {
      throw new UnauthorizedException('Organization ID é obrigatório (header x-org-id)');
    }

    // Verifica se o usuário é membro da organização
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user.userId,
          organizationId: orgId,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Você não tem acesso a esta organização');
    }

    if (!membership.isActive) {
      throw new ForbiddenException('Sua participação nesta organização está inativa');
    }

    // Adiciona dados ao request para uso posterior
    request.organizationId = orgId;
    request.membership = membership;
    request.organization = membership.organization;
    request.userRole = membership.role;

    return true;
  }
}

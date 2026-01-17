import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
      throw new UnauthorizedException('Usuario nao autenticado');
    }

    // Busca membership SUPER_ADMIN do usuario
    const superAdminMembership = await this.prisma.membership.findFirst({
      where: {
        userId: user.userId,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    if (!superAdminMembership) {
      throw new ForbiddenException('Acesso restrito a Super Admin');
    }

    // Seta a role no request para uso posterior
    request.userRole = 'SUPER_ADMIN';

    return true;
  }
}

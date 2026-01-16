import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MembershipRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Hierarquia de roles (maior = mais permissões)
const ROLE_HIERARCHY: Record<MembershipRole, number> = {
  OWNER: 100,
  ADMIN: 80,
  DOCTOR: 60,
  SECRETARY: 40,
  VIEWER: 20,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<MembershipRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se não há roles definidas, permite acesso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.userRole as MembershipRole;

    if (!userRole) {
      throw new ForbiddenException('Role não encontrada');
    }

    // Verifica se o usuário tem uma das roles requeridas ou uma role superior
    const userRoleLevel = ROLE_HIERARCHY[userRole];
    const hasPermission = requiredRoles.some((role) => {
      const requiredLevel = ROLE_HIERARCHY[role];
      return userRoleLevel >= requiredLevel;
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Acesso negado. Roles permitidas: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

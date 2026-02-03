import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { MFA_REQUIRED_KEY } from '../../../common/constants/auth.constants';
import { AuthenticatedUser } from '../../../common/interfaces/auth.interface';

const ROLES_REQUIRING_MFA = [UserRole.ADMIN, UserRole.DOCTOR];

@Injectable()
export class MfaGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const mfaExplicitlyRequired = this.reflector.getAllAndOverride<boolean>(
      MFA_REQUIRED_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      return true;
    }

    const roleRequiresMfa = ROLES_REQUIRING_MFA.includes(user.role);
    const requiresMfa = mfaExplicitlyRequired || roleRequiresMfa;

    if (!requiresMfa) {
      return true;
    }

    if (!user.mfaEnabled) {
      throw new ForbiddenException({
        code: 'MFA_SETUP_REQUIRED',
        message: 'Configuração de MFA obrigatória para este perfil',
      });
    }

    if (!user.mfaVerified) {
      throw new ForbiddenException({
        code: 'MFA_VERIFICATION_REQUIRED',
        message: 'Verificação MFA necessária',
      });
    }

    return true;
  }
}

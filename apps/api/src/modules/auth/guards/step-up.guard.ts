import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { STEP_UP_KEY, AUTH_CONSTANTS, StepUpAction } from '../../../common/constants/auth.constants';
import { StepUpPayload, AuthenticatedUser } from '../../../common/interfaces/auth.interface';

@Injectable()
export class StepUpGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredAction = this.reflector.getAllAndOverride<StepUpAction>(
      STEP_UP_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredAction) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const stepUpToken = request.cookies?.[AUTH_CONSTANTS.COOKIE_STEP_UP_TOKEN];

    if (!stepUpToken) {
      throw new ForbiddenException({
        code: 'STEP_UP_REQUIRED',
        message: `Autenticação elevada necessária para: ${requiredAction}`,
        action: requiredAction,
      });
    }

    try {
      const payload = this.jwtService.verify<StepUpPayload>(stepUpToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.sub !== user.id) {
        throw new ForbiddenException('Token step-up inválido');
      }

      if (payload.action !== requiredAction) {
        throw new ForbiddenException({
          code: 'STEP_UP_ACTION_MISMATCH',
          message: `Token step-up para ação diferente. Esperado: ${requiredAction}, Recebido: ${payload.action}`,
        });
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new ForbiddenException({
        code: 'STEP_UP_REQUIRED',
        message: `Autenticação elevada expirada ou inválida para: ${requiredAction}`,
        action: requiredAction,
      });
    }
  }
}

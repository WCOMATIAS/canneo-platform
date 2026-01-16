import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SubscriptionStatus } from '@prisma/client';

// Decorator para marcar rotas que permitem leitura mesmo com assinatura vencida
export const ALLOW_READ_ONLY_KEY = 'allowReadOnly';

@Injectable()
export class SubscriptionGuard implements CanActivate {
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
    const organizationId = request.organizationId;

    if (!organizationId) {
      // TenantGuard deve rodar antes
      return true;
    }

    // Busca a subscription ativa da organização
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      throw new ForbiddenException('Organização sem assinatura ativa');
    }

    // Adiciona subscription ao request
    request.subscription = subscription;
    request.plan = subscription.plan;

    // Verifica status da assinatura
    const blockedStatuses: SubscriptionStatus[] = ['PAST_DUE', 'CANCELED'];

    if (blockedStatuses.includes(subscription.status)) {
      const method = request.method;
      const isReadOnly = ['GET', 'HEAD', 'OPTIONS'].includes(method);

      // Permite leitura se a assinatura está PAST_DUE
      if (subscription.status === 'PAST_DUE' && isReadOnly) {
        request.isReadOnly = true;
        return true;
      }

      // Permite leitura por 30 dias após cancelamento
      if (subscription.status === 'CANCELED') {
        const canceledAt = subscription.canceledAt;
        if (canceledAt) {
          const daysSinceCanceled = Math.floor(
            (Date.now() - canceledAt.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysSinceCanceled <= 30 && isReadOnly) {
            request.isReadOnly = true;
            return true;
          }
        }

        throw new ForbiddenException(
          'Assinatura cancelada. Seus dados estarão disponíveis por 30 dias.',
        );
      }

      throw new ForbiddenException(
        'Assinatura vencida. Por favor, atualize seu pagamento para continuar.',
      );
    }

    // Verifica se trial expirou
    if (subscription.status === 'TRIAL' && subscription.trialEndsAt) {
      if (new Date() > subscription.trialEndsAt) {
        // Atualiza status para PAST_DUE
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'PAST_DUE' },
        });

        const method = request.method;
        const isReadOnly = ['GET', 'HEAD', 'OPTIONS'].includes(method);

        if (isReadOnly) {
          request.isReadOnly = true;
          return true;
        }

        throw new ForbiddenException(
          'Período de trial expirado. Por favor, assine um plano para continuar.',
        );
      }
    }

    return true;
  }
}

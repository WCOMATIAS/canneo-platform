import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

// Rotas que devem ser auditadas
const AUDIT_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Mapeamento de método HTTP para ação de auditoria
const METHOD_TO_ACTION: Record<string, AuditAction> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

// Rotas que não devem ser auditadas
const EXCLUDED_ROUTES = ['/health', '/api/v1/auth/login', '/api/v1/auth/refresh'];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, organizationId } = request;

    // Ignora rotas excluídas
    if (EXCLUDED_ROUTES.some((route) => url.includes(route))) {
      return next.handle();
    }

    // Ignora métodos que não precisam de auditoria
    if (!AUDIT_METHODS.includes(method)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async (response) => {
          try {
            // Extrai entity e entityId da URL
            const { entity, entityId } = this.extractEntityFromUrl(url);

            if (!entity) {
              return;
            }

            const action = METHOD_TO_ACTION[method];
            const responseEntityId = entityId || response?.id || response?.data?.id;

            if (!responseEntityId && action !== 'CREATE') {
              return;
            }

            await this.prisma.auditLog.create({
              data: {
                userId: user?.userId || null,
                organizationId: organizationId || null,
                action,
                entity,
                entityId: responseEntityId || 'unknown',
                newData: action !== 'DELETE' ? this.sanitizeData(body) : null,
                metadata: {
                  duration: Date.now() - startTime,
                  url,
                  method,
                },
                ipAddress: this.getClientIp(request),
                userAgent: request.headers['user-agent'] || null,
              },
            });
          } catch (error) {
            // Não quebra a request se o audit falhar
            this.logger.error(`Audit log failed: ${error.message}`);
          }
        },
        error: (error) => {
          // Opcionalmente loga erros também
          this.logger.warn(`Request failed: ${method} ${url} - ${error.message}`);
        },
      }),
    );
  }

  private extractEntityFromUrl(url: string): { entity: string | null; entityId: string | null } {
    // Remove query params e api prefix
    const cleanUrl = url.split('?')[0].replace('/api/v1/', '');
    const parts = cleanUrl.split('/').filter(Boolean);

    if (parts.length === 0) {
      return { entity: null, entityId: null };
    }

    // Primeiro segmento é a entity (ex: patients, consultations)
    const entity = this.formatEntityName(parts[0]);

    // Segundo segmento pode ser um ID (UUID)
    const entityId = parts[1] && this.isUuid(parts[1]) ? parts[1] : null;

    return { entity, entityId };
  }

  private formatEntityName(name: string): string {
    // patients -> Patient, medical-records -> MedicalRecord
    return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
      .replace(/s$/, ''); // Remove plural
  }

  private isUuid(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  private sanitizeData(data: any): any {
    if (!data) return null;

    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'cpf', 'cpfEncrypted'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }
}

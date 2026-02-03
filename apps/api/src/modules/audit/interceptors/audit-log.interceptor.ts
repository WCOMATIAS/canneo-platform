import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { createHash } from 'crypto';
import { AuditService, AuditContext } from '../services/audit.service';
import { AUDIT_LOG_KEY, AuditLogMetadata } from '../decorators/audit-log.decorator';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    tenantId?: string;
  };
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.get<AuditLogMetadata>(
      AUDIT_LOG_KEY,
      context.getHandler()
    );

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const auditContext = this.buildAuditContext(request);

    return next.handle().pipe(
      tap({
        next: (result) => {
          const resourceId = this.extractResourceId(metadata.resourceIdPath, request, result);
          const additionalMetadata = metadata.metadataExtractor
            ? metadata.metadataExtractor(request, result)
            : undefined;

          if (resourceId) {
            this.auditService.log(
              metadata.action,
              metadata.resourceType,
              resourceId,
              auditContext,
              additionalMetadata
            );
          }
        },
        error: () => {
          // Optionally log failed attempts
        },
      })
    );
  }

  private buildAuditContext(request: AuthenticatedRequest): AuditContext {
    const ip = this.getClientIp(request);
    const userAgent = request.headers['user-agent'];

    return {
      actorUserId: request.user?.id,
      actorRole: request.user?.role as AuditContext['actorRole'],
      tenantId: request.user?.tenantId,
      ipMasked: ip ? this.maskIp(ip) : undefined,
      userAgentHash: userAgent ? this.hashUserAgent(userAgent) : undefined,
      correlationId: request.headers['x-correlation-id'] as string,
    };
  }

  private extractResourceId(
    path: string | undefined,
    request: AuthenticatedRequest,
    result: unknown
  ): string | undefined {
    if (!path) {
      return undefined;
    }

    const [source, ...pathParts] = path.split('.');
    let value: unknown;

    switch (source) {
      case 'params':
        value = request.params;
        break;
      case 'body':
        value = request.body;
        break;
      case 'query':
        value = request.query;
        break;
      case 'result':
        value = result;
        break;
      default:
        return undefined;
    }

    for (const part of pathParts) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return typeof value === 'string' ? value : undefined;
  }

  private getClientIp(request: Request): string | undefined {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return ips.trim();
    }
    return request.ip || request.socket.remoteAddress;
  }

  private maskIp(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.XXX.XXX`;
    }
    // IPv6
    const v6Parts = ip.split(':');
    if (v6Parts.length >= 4) {
      return v6Parts.slice(0, 4).join(':') + ':XXXX:XXXX:XXXX:XXXX';
    }
    return 'XXX.XXX.XXX.XXX';
  }

  private hashUserAgent(userAgent: string): string {
    return createHash('sha256').update(userAgent).digest('hex').slice(0, 16);
  }
}

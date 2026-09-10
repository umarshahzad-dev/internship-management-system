import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IAuditLogRepository } from '../../application/ports/audit-log.repository.port';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const isMutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(
      request.method,
    );
    if (!isMutation) return next.handle();

    const forwarded = request.headers['x-forwarded-for'];
    const ipAddress =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : Array.isArray(forwarded)
          ? forwarded[0].trim()
          : request.socket?.remoteAddress || 'UNKNOWN';

    const userId = request.user?.id || null;
    const userRole = request.user?.role || null;

    const payload = request.body
      ? this.redactSensitiveData(JSON.parse(JSON.stringify(request.body)))
      : {};
    payload.query = this.redactSensitiveData({ ...(request.query ?? {}) });
    payload.headers = this.redactSensitiveData({
      'content-type': request.headers['content-type'],
      'user-agent': request.headers['user-agent'],
    });

    return next.handle().pipe(
      tap({
        next: () =>
          this.logAction(
            request,
            response.statusCode,
            userId,
            userRole,
            ipAddress,
            payload,
          ),
        error: (error) => {
          const statusCode =
            error?.statusCode ||
            error?.status ||
            (typeof error?.getStatus === 'function' ? error.getStatus() : 500);
          this.logAction(
            request,
            statusCode,
            userId,
            userRole,
            ipAddress,
            payload,
          );
        },
      }),
    );
  }

  private logAction(
    req: any,
    statusCode: number,
    userId: string | null,
    userRole: string | null,
    ipAddress: string,
    payload: any,
  ) {
    this.auditLogRepository
      .createLog({
        userId,
        userRole,
        method: req.method,
        path: this.sanitizeUrl(req.url),
        payload,
        ipAddress,
        statusCode,
      })
      .catch((err) =>
        this.logger.error('Failed to write audit log', err.stack),
      );
  }

  private redactSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'authorization',
      'csrf',
      'cookie',
      'x-csrf-token',
    ];

    for (const key of Object.keys(data)) {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        data[key] = '[REDACTED]';
      } else if (typeof data[key] === 'object') {
        data[key] = this.redactSensitiveData(data[key]);
      }
    }
    return data;
  }

  private sanitizeUrl(value: string): string {
    try {
      const parsed = new URL(value, 'http://audit.local');
      for (const key of ['token', 'authorization', 'cookie', 'x-csrf-token']) {
        if (parsed.searchParams.has(key)) parsed.searchParams.set(key, '[REDACTED]');
      }
      return `${parsed.pathname}${parsed.search}`;
    } catch {
      return value;
    }
  }
}

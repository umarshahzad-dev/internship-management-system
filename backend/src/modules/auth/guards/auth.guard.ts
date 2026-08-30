import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ISessionRepository } from '../../../application/ports/session.repository.port';
import { IUserRepository } from '../../../application/ports/user.repository.port';
import { IJwtService } from '../../../application/ports/jwt.service.port';
import { IDateProvider } from '../../../application/ports/date-provider.port';
import { IConfigProvider } from '../../../application/ports/config-provider.port';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    departmentId: string | null;
  };
  session?: {
    id: string;
    userId: string;
    csrfToken: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
    private readonly dateProvider: IDateProvider,
    private readonly config: IConfigProvider,
  ) {}

  private getCookieFromRequest(
    request: Request,
    name: string,
  ): string | undefined {
    if (request.cookies && request.cookies[name]) {
      return request.cookies[name];
    }
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) return undefined;
    const cookies = cookieHeader.split(';').reduce(
      (acc, pair) => {
        const [key, ...val] = pair.trim().split('=');
        acc[key] = val.join('=');
        return acc;
      },
      {} as Record<string, string>,
    );
    return cookies[name];
  }

  private async validateSession(sessionId: string): Promise<boolean> {
    const now = this.dateProvider.now();
    const session = await this.sessionRepository.findById(sessionId);
    if (!session || session.isRevoked() || session.isExpired(now)) {
      return false;
    }

    const idleTimeoutSeconds = await this.config.get<number>(
      'auth.session_idle_seconds',
      30 * 60,
    );
    const idleTimeoutMs = idleTimeoutSeconds * 1000;
    const lastActivity = session.lastActivityAt.getTime();
    if (now.getTime() - lastActivity > idleTimeoutMs) {
      return false;
    }

    // Throttle update: only if more than 60 seconds since last activity
    if (now.getTime() - lastActivity > 60 * 1000) {
      await this.sessionRepository.touch(session.id, now);
    }

    return true;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const sessionCookie = this.getCookieFromRequest(request, 'imas_session');
    if (sessionCookie) {
      const isValid = await this.validateSession(sessionCookie);
      if (!isValid) throw new UnauthorizedException('UNAUTHENTICATED');

      const session = await this.sessionRepository.findById(sessionCookie);
      const user = await this.userRepository.findById(session!.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('UNAUTHENTICATED');
      }
      request.session = {
        id: session!.id,
        userId: session!.userId,
        csrfToken: session!.csrfToken,
      };
      request.user = {
        id: user.id,
        email: user.email.toValue(),
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.getValue(),
        departmentId: user.departmentId,
      };
      return true;
    }

    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const payload = await this.jwtService.verifyAccessToken(token);
      if (!payload || !payload.sessionId) {
        throw new UnauthorizedException('UNAUTHENTICATED');
      }
      const isValid = await this.validateSession(payload.sessionId);
      if (!isValid) throw new UnauthorizedException('UNAUTHENTICATED');

      const session = await this.sessionRepository.findById(payload.sessionId);
      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('UNAUTHENTICATED');
      }
      request.session = {
        id: session!.id,
        userId: session!.userId,
        csrfToken: session!.csrfToken,
      };
      request.user = {
        id: user.id,
        email: user.email.toValue(),
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.getValue(),
        departmentId: user.departmentId,
      };
      return true;
    }

    throw new UnauthorizedException('UNAUTHENTICATED');
  }
}

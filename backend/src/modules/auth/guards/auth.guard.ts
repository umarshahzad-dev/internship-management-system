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
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const now = this.dateProvider.now();

    // Browser session via cookie
    const sessionCookie = request.cookies?.['imas_session'];
    if (sessionCookie) {
      const session = await this.sessionRepository.findById(sessionCookie);
      if (!session || session.isRevoked() || session.isExpired(now)) {
        throw new UnauthorizedException('UNAUTHENTICATED');
      }
      const user = await this.userRepository.findById(session.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('UNAUTHENTICATED');
      }
      request.session = {
        id: session.id,
        userId: session.userId,
        csrfToken: session.csrfToken,
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

    // Bearer token
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const payload = await this.jwtService.verifyAccessToken(token);
      if (!payload || !payload.sessionId) {
        throw new UnauthorizedException('UNAUTHENTICATED');
      }
      const session = await this.sessionRepository.findById(payload.sessionId);
      if (!session || session.isRevoked() || session.isExpired(now)) {
        throw new UnauthorizedException('UNAUTHENTICATED');
      }
      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('UNAUTHENTICATED');
      }
      request.session = {
        id: session.id,
        userId: session.userId,
        csrfToken: session.csrfToken,
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

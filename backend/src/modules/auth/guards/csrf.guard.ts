import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { AuthenticatedRequest } from './auth.guard';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // If the request uses bearer token auth, CSRF is not required.
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return true;
    }

    const csrfToken = request.headers['x-csrf-token'];
    const sessionCsrf = request.session?.csrfToken;
    if (!csrfToken || !sessionCsrf || csrfToken !== sessionCsrf) {
      throw new ForbiddenException('CSRF_INVALID');
    }
    return true;
  }
}

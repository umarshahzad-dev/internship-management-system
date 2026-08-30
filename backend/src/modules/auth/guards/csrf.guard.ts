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
    const csrfToken = request.headers['x-csrf-token'];
    const sessionCsrf = request.session?.csrfToken;
    if (!csrfToken || !sessionCsrf || csrfToken !== sessionCsrf) {
      throw new ForbiddenException('CSRF_INVALID');
    }
    return true;
  }
}

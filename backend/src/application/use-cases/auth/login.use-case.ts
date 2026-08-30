import { Injectable } from '@nestjs/common';
import { randomUUID, createHash } from 'crypto';
import { Session } from '../../../domain/entities/session.entity';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { UserSecurityState } from '../../../domain/entities/user-security-state.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../domain/value-objects/role.vo';
import { IUserRepository } from '../../ports/user.repository.port';
import { IUserSecurityStateRepository } from '../../ports/user-security-state.repository.port';
import { IPasswordHasher } from '../../ports/password-hasher.port';
import { ITokenGenerator } from '../../ports/token-generator.port';
import { IJwtService } from '../../ports/jwt.service.port';
import { ISessionRepository } from '../../ports/session.repository.port';
import { IRefreshTokenRepository } from '../../ports/refresh-token.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { IConfigProvider } from '../../ports/config-provider.port';

export interface LoginInput {
  email: string;
  password: string;
  isBrowser: boolean;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    departmentId: string | null;
  };
  sessionId?: string;
  csrfToken?: string;
  accessToken?: string;
  refreshToken?: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityStateRepository: IUserSecurityStateRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly jwtService: IJwtService,
    private readonly sessionRepository: ISessionRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly dateProvider: IDateProvider,
    private readonly config: IConfigProvider,
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const email = new Email(input.email);
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const now = this.dateProvider.now();

    const securityState = await this.securityStateRepository.findByUserId(
      user.id,
    );
    if (securityState && securityState.isLocked(now)) {
      throw new Error('ACCOUNT_LOCKED');
    }

    const passwordValid = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );
    if (!passwordValid) {
      const state =
        securityState ?? (await this.createInitialSecurityState(user.id));
      state.incrementFailedAttempts();
      const maxAttempts = await this.config.get<number>(
        'auth.max_failed_attempts',
        5,
      );
      if (state.failedLoginAttempts >= maxAttempts) {
        const lockDurationMinutes = await this.config.get<number>(
          'auth.lock_duration_minutes',
          15,
        );
        const lockUntil = new Date(
          now.getTime() + lockDurationMinutes * 60 * 1000,
        );
        state.lockUntil(lockUntil);
      }
      await this.securityStateRepository.update(state);
      throw new Error('INVALID_CREDENTIALS');
    }

    if (securityState) {
      securityState.resetFailedAttempts();
      await this.securityStateRepository.update(securityState);
    } else {
      await this.createInitialSecurityState(user.id);
    }

    user.updateLastLogin(now);
    await this.userRepository.update(user);

    const csrfToken = this.tokenGenerator.generateCsrfToken();
    const sessionId = randomUUID();
    const absoluteTimeoutSeconds = await this.config.get<number>(
      'auth.session_absolute_seconds',
      24 * 60 * 60,
    );
    const sessionExpiresAt = new Date(
      now.getTime() + absoluteTimeoutSeconds * 1000,
    );
    const session = new Session(
      sessionId,
      user.id,
      csrfToken,
      sessionExpiresAt,
      now,
      null,
      now,
    );
    await this.sessionRepository.create(session);

    if (input.isBrowser) {
      return {
        user: {
          id: user.id,
          email: user.email.toValue(),
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.getValue(),
          departmentId: user.departmentId,
        },
        sessionId: session.id,
        csrfToken,
      };
    }

    const accessToken = await this.jwtService.signAccessToken({
      sub: user.id,
      sessionId: session.id,
      departmentId: user.departmentId,
      role: user.role.getValue(),
    });

    const refreshTokenPlain = this.tokenGenerator.generateRandomToken(32);
    const refreshTokenHash = this.hashToken(refreshTokenPlain);
    const refreshTokenLifetimeSeconds = await this.config.get<number>(
      'auth.refresh_token_lifetime_seconds',
      7 * 24 * 60 * 60,
    );
    const refreshTokenExpiresAt = new Date(
      now.getTime() + refreshTokenLifetimeSeconds * 1000,
    );
    const refreshToken = new RefreshToken(
      randomUUID(),
      user.id,
      session.id,
      refreshTokenHash,
      refreshTokenExpiresAt,
      null,
      null,
      now,
    );
    await this.refreshTokenRepository.create(refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email.toValue(),
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.getValue(),
        departmentId: user.departmentId,
      },
      sessionId: session.id,
      csrfToken,
      accessToken,
      refreshToken: refreshTokenPlain,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async createInitialSecurityState(
    userId: string,
  ): Promise<UserSecurityState> {
    const now = this.dateProvider.now();
    const state = new UserSecurityState(userId, 0, null, now, now);
    await this.securityStateRepository.create(state);
    return state;
  }
}

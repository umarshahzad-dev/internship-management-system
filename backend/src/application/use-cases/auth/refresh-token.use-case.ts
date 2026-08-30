import { Injectable } from '@nestjs/common';
import { randomUUID, createHash } from 'crypto';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { Session } from '../../../domain/entities/session.entity';
import { IRefreshTokenRepository } from '../../ports/refresh-token.repository.port';
import { IUserRepository } from '../../ports/user.repository.port';
import { ISessionRepository } from '../../ports/session.repository.port';
import { ITokenGenerator } from '../../ports/token-generator.port';
import { IJwtService } from '../../ports/jwt.service.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { IConfigProvider } from '../../ports/config-provider.port';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly jwtService: IJwtService,
    private readonly dateProvider: IDateProvider,
    private readonly config: IConfigProvider,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenResult> {
    const tokenHash = this.hashToken(input.refreshToken);
    const existingToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);
    if (!existingToken) {
      throw new Error('TOKEN_REUSE_DETECTED');
    }

    const now = this.dateProvider.now();

    if (
      existingToken.isRotated() ||
      existingToken.isRevoked() ||
      existingToken.isExpired(now)
    ) {
      await this.refreshTokenRepository.revokeAllForUser(
        existingToken.userId,
        now,
      );
      throw new Error('TOKEN_REUSE_DETECTED');
    }

    const user = await this.userRepository.findById(existingToken.userId);
    if (!user || !user.isActive) {
      throw new Error('UNAUTHENTICATED');
    }

    // Revoke the session bound to this refresh token
    await this.sessionRepository.revoke(existingToken.sessionId, now);

    // Mark current refresh token as rotated
    existingToken.markRotated(now);
    await this.refreshTokenRepository.update(existingToken);

    // Create new session
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

    // Create new access token
    const accessToken = await this.jwtService.signAccessToken({
      sub: user.id,
      sessionId: session.id,
      departmentId: user.departmentId,
      role: user.role.getValue(),
    });

    // Create new refresh token bound to new session
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
      accessToken,
      refreshToken: refreshTokenPlain,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

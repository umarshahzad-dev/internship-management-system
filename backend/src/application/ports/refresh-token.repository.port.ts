import { RefreshToken } from '../../domain/entities/refresh-token.entity';

export abstract class IRefreshTokenRepository {
  abstract findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  abstract create(token: RefreshToken): Promise<RefreshToken>;
  abstract update(token: RefreshToken): Promise<RefreshToken>;
  abstract revokeAllForUser(userId: string, revokedAt: Date): Promise<void>;
  abstract deleteExpired(now: Date): Promise<void>;
}

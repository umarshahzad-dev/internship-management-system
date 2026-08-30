import { RefreshToken } from '../../domain/entities/refresh-token.entity';

export interface IRefreshTokenRepository {
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  create(token: RefreshToken): Promise<RefreshToken>;
  update(token: RefreshToken): Promise<RefreshToken>;
  revokeAllForUser(userId: string, revokedAt: Date): Promise<void>;
  deleteExpired(now: Date): Promise<void>;
}

import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenEntity } from '../database/entities/refresh-token.entity';

export class RefreshTokenMapper {
  static toDomain(entity: RefreshTokenEntity): RefreshToken {
    return new RefreshToken(
      entity.id,
      entity.userId,
      entity.sessionId,
      entity.tokenHash,
      entity.expiresAt,
      entity.rotatedAt,
      entity.revokedAt,
      entity.createdAt,
    );
  }

  static toPersistence(domain: RefreshToken): RefreshTokenEntity {
    const entity = new RefreshTokenEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.sessionId = domain.sessionId;
    entity.tokenHash = domain.tokenHash;
    entity.expiresAt = domain.expiresAt;
    entity.rotatedAt = domain.rotatedAt;
    entity.revokedAt = domain.revokedAt;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}

import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';
import { PasswordResetTokenEntity } from '../database/entities/password-reset-token.entity';

export class PasswordResetTokenMapper {
  static toDomain(entity: PasswordResetTokenEntity): PasswordResetToken {
    return new PasswordResetToken(
      entity.id,
      entity.userId,
      entity.tokenHash,
      entity.expiresAt,
      entity.usedAt,
      entity.createdAt,
    );
  }

  static toPersistence(domain: PasswordResetToken): PasswordResetTokenEntity {
    const entity = new PasswordResetTokenEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.tokenHash = domain.tokenHash;
    entity.expiresAt = domain.expiresAt;
    entity.usedAt = domain.usedAt;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}

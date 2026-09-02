import { EmployerToken } from '../../domain/entities/employer-token.entity';
import { EmployerTokenEntity } from '../database/entities/employer-token.entity';

export class EmployerTokenMapper {
  static toDomain(entity: EmployerTokenEntity): EmployerToken {
    return new EmployerToken(
      entity.tokenHash,
      entity.internshipId,
      entity.expiresAt,
      entity.isUsed,
      entity.usedAt,
      entity.createdAt,
    );
  }

  static toPersistence(domain: EmployerToken): EmployerTokenEntity {
    const entity = new EmployerTokenEntity();
    entity.tokenHash = domain.tokenHash;
    entity.internshipId = domain.internshipId;
    entity.expiresAt = domain.expiresAt;
    entity.isUsed = domain.isUsed;
    entity.usedAt = domain.usedAt;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}

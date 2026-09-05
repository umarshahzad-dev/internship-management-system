import { EmployerToken } from '../../domain/entities/employer-token.entity';
import { EmployerTokenEntity } from '../database/entities/employer-token.entity';
import { EmployerTokenType } from '../../domain/enums/employer-token-type.enum';

export class EmployerTokenMapper {
  static toDomain(entity: EmployerTokenEntity): EmployerToken {
    return new EmployerToken(
      entity.tokenHash,
      entity.internshipId,
      entity.tokenType || EmployerTokenType.EVALUATION,
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
    entity.tokenType = domain.type;
    entity.expiresAt = domain.expiresAt;
    entity.isUsed = domain.isUsed;
    entity.usedAt = domain.usedAt;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}

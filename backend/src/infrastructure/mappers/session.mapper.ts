import { Session } from '../../domain/entities/session.entity';
import { SessionEntity } from '../database/entities/session.entity';

export class SessionMapper {
  static toDomain(entity: SessionEntity): Session {
    return new Session(
      entity.id,
      entity.userId,
      entity.csrfToken,
      entity.expiresAt,
      entity.lastActivityAt,
      entity.revokedAt,
      entity.createdAt,
    );
  }

  static toPersistence(domain: Session): SessionEntity {
    const entity = new SessionEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.csrfToken = domain.csrfToken;
    entity.expiresAt = domain.expiresAt;
    entity.lastActivityAt = domain.lastActivityAt;
    entity.revokedAt = domain.revokedAt;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}

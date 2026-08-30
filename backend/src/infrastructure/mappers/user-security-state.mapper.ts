import { UserSecurityState } from '../../domain/entities/user-security-state.entity';
import { UserSecurityStateEntity } from '../database/entities/user-security-state.entity';

export class UserSecurityStateMapper {
  static toDomain(entity: UserSecurityStateEntity): UserSecurityState {
    return new UserSecurityState(
      entity.userId,
      entity.failedLoginAttempts,
      entity.lockedUntil,
      entity.passwordChangedAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: UserSecurityState): UserSecurityStateEntity {
    const entity = new UserSecurityStateEntity();
    entity.userId = domain.userId;
    entity.failedLoginAttempts = domain.failedLoginAttempts;
    entity.lockedUntil = domain.lockedUntil;
    entity.passwordChangedAt = domain.passwordChangedAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}

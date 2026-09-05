import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Role, UserRole } from '../../domain/value-objects/role.vo';
import { UserEntity } from '../database/entities/user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    const role = new Role(entity.role as UserRole);
    const email = new Email(entity.email);
    return new User(
      entity.id,
      entity.departmentId,
      email,
      entity.passwordHash,
      role,
      entity.firstName,
      entity.lastName,
      entity.studentNumber,
      entity.profilePhotoPath,
      entity.isActive,
      entity.lastLogin,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.departmentId = domain.departmentId;
    entity.email = domain.email.toValue();
    entity.passwordHash = domain.passwordHash;
    entity.role = domain.role.getValue() as UserRole;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.studentNumber = domain.studentNumber;
    entity.profilePhotoPath = domain.profilePhotoPath;
    entity.isActive = domain.isActive;
    entity.lastLogin = domain.lastLogin;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}

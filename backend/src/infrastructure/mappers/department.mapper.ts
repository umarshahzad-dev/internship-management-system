import { Department } from '../../domain/entities/department.entity';
import { DepartmentEntity } from '../database/entities/department.entity';

export class DepartmentMapper {
  static toDomain(entity: DepartmentEntity): Department {
    return new Department(
      entity.id,
      entity.name,
      entity.facultyName,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: Department): DepartmentEntity {
    const entity = new DepartmentEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.facultyName = domain.facultyName;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}

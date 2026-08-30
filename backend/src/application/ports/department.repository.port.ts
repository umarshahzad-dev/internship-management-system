import { Department } from '../../domain/entities/department.entity';

export abstract class IDepartmentRepository {
  abstract findById(id: string): Promise<Department | null>;
  abstract create(department: Department): Promise<Department>;
}

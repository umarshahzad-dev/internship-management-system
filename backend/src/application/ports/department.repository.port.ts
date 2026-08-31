import { Department } from '../../domain/entities/department.entity';

export abstract class IDepartmentRepository {
  abstract findById(id: string): Promise<Department | null>;
  abstract findAll(): Promise<Department[]>;
  abstract create(department: Department): Promise<Department>;
  abstract update(department: Department): Promise<Department>;
}

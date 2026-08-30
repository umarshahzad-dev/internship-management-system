import { Department } from '../../domain/entities/department.entity';

export interface IDepartmentRepository {
  findById(id: string): Promise<Department | null>;
  create(department: Department): Promise<Department>;
}

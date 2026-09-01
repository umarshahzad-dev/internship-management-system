import { Injectable } from '@nestjs/common';
import { IDepartmentRepository } from '../../ports/department.repository.port';

export interface DepartmentListItem {
  id: string;
  name: string;
  facultyName: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ListDepartmentsUseCase {
  constructor(private readonly departmentRepository: IDepartmentRepository) {}

  async execute(): Promise<DepartmentListItem[]> {
    const departments = await this.departmentRepository.findAll();
    return departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      facultyName: dept.facultyName,
      createdAt: dept.createdAt.toISOString(),
      updatedAt: dept.updatedAt.toISOString(),
    }));
  }
}

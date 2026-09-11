import { Injectable } from '@nestjs/common';
import { IDepartmentRepository } from '../../ports/department.repository.port';
import { paginate, PaginatedResult } from '../../../common/pagination/paginate';

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

  async execute(options: { search?: string; page?: string; pageSize?: string; sortBy?: string; sortDir?: string } = {}): Promise<PaginatedResult<DepartmentListItem>> {
    const departments = await this.departmentRepository.findAll();
    const items = departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      facultyName: dept.facultyName,
      createdAt: dept.createdAt.toISOString(),
      updatedAt: dept.updatedAt.toISOString(),
    })).filter((dept) => !options.search || `${dept.name} ${dept.facultyName}`.toLocaleLowerCase('tr-TR').includes(options.search.toLocaleLowerCase('tr-TR')));
    const sorted = [...items].sort((a, b) => {
      const key = options.sortBy === 'facultyName' ? 'facultyName' : 'name';
      const result = String(a[key]).localeCompare(String(b[key]), 'tr-TR');
      return options.sortDir === 'desc' ? -result : result;
    });
    return paginate(sorted, options.page, options.pageSize);
  }
}

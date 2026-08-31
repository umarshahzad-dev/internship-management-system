import { Injectable } from '@nestjs/common';
import { IDepartmentRepository } from '../../ports/department.repository.port';

@Injectable()
export class ListDepartmentsUseCase {
  constructor(private readonly departmentRepository: IDepartmentRepository) {}

  async execute() {
    return this.departmentRepository.findAll();
  }
}

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Department } from '../../../domain/entities/department.entity';
import { IDepartmentRepository } from '../../ports/department.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';

export interface CreateDepartmentInput {
  name: string;
  facultyName: string;
}

@Injectable()
export class CreateDepartmentUseCase {
  constructor(
    private readonly departmentRepository: IDepartmentRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: CreateDepartmentInput): Promise<Department> {
    const now = this.dateProvider.now();
    const department = new Department(
      randomUUID(),
      input.name,
      input.facultyName,
      now,
      now,
    );
    return this.departmentRepository.create(department);
  }
}

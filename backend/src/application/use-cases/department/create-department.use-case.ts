import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Department } from '../../../domain/entities/department.entity';
import { IDepartmentRepository } from '../../ports/department.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';

export interface CreateDepartmentInput {
  name: string;
  facultyName: string;
}

export interface CreateDepartmentResult {
  id: string;
  name: string;
  facultyName: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class CreateDepartmentUseCase {
  constructor(
    private readonly departmentRepository: IDepartmentRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: CreateDepartmentInput): Promise<CreateDepartmentResult> {
    const now = this.dateProvider.now();
    const department = new Department(
      randomUUID(),
      input.name,
      input.facultyName,
      now,
      now,
    );

    const saved = await this.departmentRepository.create(department);
    return {
      id: saved.id,
      name: saved.name,
      facultyName: saved.facultyName,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    };
  }
}

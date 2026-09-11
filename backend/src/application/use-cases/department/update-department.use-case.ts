import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { Department } from '../../../domain/entities/department.entity';
import { IDateProvider } from '../../ports/date-provider.port';
import { IDepartmentRepository } from '../../ports/department.repository.port';

@Injectable()
export class UpdateDepartmentUseCase {
  constructor(private readonly repository: IDepartmentRepository, private readonly dates: IDateProvider) {}

  async execute(id: string, input: { name?: string; facultyName?: string }) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new DomainException('NOT_FOUND', 'Department not found', 404);
    const name = input.name?.trim() || existing.name;
    const facultyName = input.facultyName?.trim() || existing.facultyName;
    const duplicate = await this.repository.findByName(name);
    if (duplicate && duplicate.id !== id) throw new DomainException('CONFLICT', 'Department name already exists', 409);
    const updated = await this.repository.update(new Department(id, name, facultyName, existing.createdAt, this.dates.now()));
    return { id: updated.id, name: updated.name, facultyName: updated.facultyName, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../domain/entities/department.entity';
import { IDepartmentRepository } from '../../application/ports/department.repository.port';
import { DepartmentEntity } from '../database/entities/department.entity';
import { DepartmentMapper } from '../mappers/department.mapper';

@Injectable()
export class DepartmentRepository extends IDepartmentRepository {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Department | null> {
    const entity = await this.departmentRepository.findOne({ where: { id } });
    return entity ? DepartmentMapper.toDomain(entity) : null;
  }

  async create(department: Department): Promise<Department> {
    const entity = DepartmentMapper.toPersistence(department);
    const saved = await this.departmentRepository.save(entity);
    return DepartmentMapper.toDomain(saved);
  }
}

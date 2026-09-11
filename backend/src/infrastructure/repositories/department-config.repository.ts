import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IDepartmentConfigRepository } from '../../application/ports/department-config.repository.port'
import { DepartmentConfig } from '../../domain/entities/department-config.entity'
import { DepartmentConfigEntity } from '../database/entities/department-config.entity'

@Injectable()
export class DepartmentConfigRepository implements IDepartmentConfigRepository {
  constructor(@InjectRepository(DepartmentConfigEntity) private readonly repo: Repository<DepartmentConfigEntity>) {}
  private map(row: DepartmentConfigEntity) { return new DepartmentConfig(row.id, row.departmentId, row.key, row.value, row.createdAt, row.updatedAt) }
  async find(departmentId: string, key: string) { const row = await this.repo.findOne({ where: { departmentId, key } }); return row ? this.map(row) : null }
  async findByDepartment(departmentId: string) { return (await this.repo.find({ where: { departmentId } })).map((row) => this.map(row)) }
  async upsert(config: DepartmentConfig) { const row = await this.repo.save({ id: config.id, departmentId: config.departmentId, key: config.key, value: config.value }); return this.map(row) }
  async delete(departmentId: string, key: string) { await this.repo.delete({ departmentId, key }) }
}

import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { DepartmentConfig } from '../../../domain/entities/department-config.entity'
import { IDepartmentConfigRepository } from '../../ports/department-config.repository.port'
import { ISystemConfigRepository, SystemConfigData } from '../../ports/system-config.repository.port'
import { DomainException } from '../../../common/exceptions/domain.exception'
import { validateSystemConfigValue } from './manage-system-config.use-case'

@Injectable()
export class ResolveConfigValueUseCase {
  private cache = new Map<string, { expiresAt: number; value: Array<SystemConfigData & { globalValue: string; effectiveValue: string; isOverridden: boolean }> }>()
  constructor(private readonly globals: ISystemConfigRepository, private readonly overrides: IDepartmentConfigRepository) {}
  async execute(departmentId?: string) {
    const key = departmentId ?? 'global'; const cached = this.cache.get(key); if (cached && cached.expiresAt > Date.now()) return cached.value
    const configs = await this.globals.findAll(true); const departmentRows = departmentId ? await this.overrides.findByDepartment(departmentId) : []; const map = new Map(departmentRows.map((row) => [row.key, row.value]));
    const resolved = configs.map((config) => ({ ...config, globalValue: config.value, effectiveValue: map.get(config.key) ?? config.value, isOverridden: map.has(config.key) })); this.cache.set(key, { value: resolved, expiresAt: Date.now() + 60_000 }); return resolved
  }
  async override(departmentId: string, key: string, value: string) { const configs = await this.globals.findAll(true); const target = configs.find((config) => config.key === key); if (!target) throw new DomainException('NOT_FOUND', `Configuration key '${key}' does not exist`, 404); const error = validateSystemConfigValue(key, value, configs); if (error) throw new DomainException('VALIDATION_ERROR', error, 400); const saved = await this.overrides.upsert(new DepartmentConfig(randomUUID(), departmentId, key, value, new Date(), new Date())); this.cache.clear(); return saved }
  async remove(departmentId: string, key: string) { await this.overrides.delete(departmentId, key); this.cache.clear() }
}

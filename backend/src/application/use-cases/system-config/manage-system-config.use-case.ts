import { Injectable } from '@nestjs/common';
import {
  ISystemConfigRepository,
  SystemConfigData,
} from '../../ports/system-config.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { MaintenanceModeMiddleware } from '../../../common/middleware/maintenance-mode.middleware';

export function validateSystemConfigValue(key: string, value: string, configs: SystemConfigData[] = []): string | null {
  const valid = key === 'ACADEMIC_YEAR' ? /^\d{4}-\d{4}$/.test(value) : key === 'ACTIVE_SEMESTER' ? ['GÜZ', 'BAHAR', 'YAZ'].includes(value) : ['MIN_INTERNSHIP_DAYS', 'MAX_INTERNSHIP_DAYS'].includes(key) ? /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 365 : key === 'APP_SUBMISSION_DEADLINE' ? /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) : true;
  if (!valid) return `${key} değeri geçersiz`;
  if (key === 'MAX_INTERNSHIP_DAYS') { const minimum = configs.find((config) => config.key === 'MIN_INTERNSHIP_DAYS'); if (minimum && Number(value) < Number(minimum.value)) return 'MAX_INTERNSHIP_DAYS, MIN_INTERNSHIP_DAYS değerinden küçük olamaz'; }
  if (key === 'MIN_INTERNSHIP_DAYS') { const maximum = configs.find((config) => config.key === 'MAX_INTERNSHIP_DAYS'); if (maximum && Number(value) > Number(maximum.value)) return 'MIN_INTERNSHIP_DAYS, MAX_INTERNSHIP_DAYS değerini aşamaz'; }
  return null;
}

@Injectable()
export class ManageSystemConfigUseCase {
  // This cache is process-local; replace with Redis or another shared cache when scaling horizontally.
  private cache: { data: SystemConfigData[]; expiresAt: number } | null = null;
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly configRepo: ISystemConfigRepository) {}

  async getAllConfigs(role?: string): Promise<SystemConfigData[]> {
    const isAdmin = role === 'ADMIN';
    const now = Date.now();

    if (!this.cache || this.cache.expiresAt < now) {
      const allData = await this.configRepo.findAll(true);
      this.cache = { data: allData, expiresAt: now + this.TTL_MS };
    }

    if (isAdmin) {
      return this.cache.data;
    }
    return this.cache.data.filter((config) => config.isPublic);
  }

  async updateConfig(key: string, value: string, role: string): Promise<void> {
    if (role !== 'ADMIN') {
      throw new DomainException(
        'FORBIDDEN',
        'Only administrators can modify system configurations',
        403,
      );
    }

    const configs = await this.configRepo.findAll(true);
    const target = configs.find((c) => c.key === key);

    if (!target) {
      throw new DomainException(
        'NOT_FOUND',
        `Configuration key '${key}' does not exist`,
        404,
      );
    }

    const validationError = validateSystemConfigValue(key, value, configs);
    if (validationError) throw new DomainException('VALIDATION_ERROR', validationError, 400);

    await this.configRepo.upsert(
      key,
      value,
      target.description,
      target.isPublic,
    );

    // Invalidate cache immediately on mutation
    this.cache = null;
    if (key === 'MAINTENANCE_MODE') MaintenanceModeMiddleware.invalidateAll();
  }

  invalidateMaintenanceCache() { MaintenanceModeMiddleware.invalidateAll(); }
}

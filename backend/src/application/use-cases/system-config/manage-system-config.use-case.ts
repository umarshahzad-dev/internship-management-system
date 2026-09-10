import { Injectable } from '@nestjs/common';
import {
  ISystemConfigRepository,
  SystemConfigData,
} from '../../ports/system-config.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

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

    await this.configRepo.upsert(
      key,
      value,
      target.description,
      target.isPublic,
    );

    // Invalidate cache immediately on mutation
    this.cache = null;
  }
}

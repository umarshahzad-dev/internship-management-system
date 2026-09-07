import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ISystemConfigRepository,
  SystemConfigData,
} from '../../application/ports/system-config.repository.port';
import { SystemConfigEntity } from '../database/entities/system-config.entity';

@Injectable()
export class SystemConfigRepository implements ISystemConfigRepository {
  constructor(
    @InjectRepository(SystemConfigEntity)
    private readonly repo: Repository<SystemConfigEntity>,
  ) {}

  async findByKey(key: string): Promise<string | null> {
    const config = await this.repo.findOne({ where: { key } });
    return config?.value || null;
  }

  async findAll(includePrivate = false): Promise<SystemConfigData[]> {
    if (includePrivate) return this.repo.find();
    return this.repo.find({ where: { isPublic: true } });
  }

  async upsert(
    key: string,
    value: string,
    description: string,
    isPublic: boolean,
  ): Promise<void> {
    await this.repo.save({ key, value, description, isPublic });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IAuditLogRepository,
  CreateAuditLogDto,
} from '../../application/ports/audit-log.repository.port';
import { AuditLogEntity } from '../database/entities/audit-log.entity';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repository: Repository<AuditLogEntity>,
  ) {}

  async createLog(logData: CreateAuditLogDto): Promise<void> {
    const log = this.repository.create(logData);
    await this.repository.save(log);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyLog } from '../../domain/entities/daily-log.entity';
import { IDailyLogRepository } from '../../application/ports/daily-log.repository.port';
import { DailyLogEntity } from '../database/entities/daily-log.entity';
import { DailyLogMapper } from '../mappers/daily-log.mapper';

@Injectable()
export class DailyLogRepository extends IDailyLogRepository {
  constructor(
    @InjectRepository(DailyLogEntity)
    private readonly dailyLogRepository: Repository<DailyLogEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<DailyLog | null> {
    const entity = await this.dailyLogRepository.findOne({ where: { id } });
    return entity ? DailyLogMapper.toDomain(entity) : null;
  }

  async findByInternship(internshipId: string): Promise<DailyLog[]> {
    const entities = await this.dailyLogRepository.find({
      where: { internshipId },
      order: { logDate: 'ASC' },
    });
    return entities.map(DailyLogMapper.toDomain);
  }

  async create(log: DailyLog): Promise<DailyLog> {
    const entity = DailyLogMapper.toPersistence(log);
    const saved = await this.dailyLogRepository.save(entity);
    return DailyLogMapper.toDomain(saved);
  }

  async update(log: DailyLog): Promise<DailyLog> {
    const entity = DailyLogMapper.toPersistence(log);
    await this.dailyLogRepository.update({ id: log.id }, entity);
    const updated = await this.dailyLogRepository.findOne({
      where: { id: log.id },
    });
    return updated ? DailyLogMapper.toDomain(updated) : log;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SgkStatusHistory } from '../../domain/entities/sgk-status-history.entity';
import { ISgkStatusHistoryRepository } from '../../application/ports/sgk-status-history.repository.port';
import { SgkStatusHistoryEntity } from '../database/entities/sgk-status-history.entity';
import { SgkStatusHistoryMapper } from '../mappers/sgk-status-history.mapper';

@Injectable()
export class SgkStatusHistoryRepository extends ISgkStatusHistoryRepository {
  constructor(
    @InjectRepository(SgkStatusHistoryEntity)
    private readonly historyRepository: Repository<SgkStatusHistoryEntity>,
  ) {
    super();
  }

  async findBySgkTracking(sgkTrackingId: string): Promise<SgkStatusHistory[]> {
    const entities = await this.historyRepository.find({
      where: { sgkTrackingId },
      order: { changedAt: 'ASC' },
    });
    return entities.map(SgkStatusHistoryMapper.toDomain);
  }

  async create(history: SgkStatusHistory): Promise<SgkStatusHistory> {
    const entity = SgkStatusHistoryMapper.toPersistence(history);
    const saved = await this.historyRepository.save(entity);
    return SgkStatusHistoryMapper.toDomain(saved);
  }
}

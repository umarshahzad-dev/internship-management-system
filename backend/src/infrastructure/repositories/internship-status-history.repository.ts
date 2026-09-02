import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternshipStatusHistory } from '../../domain/entities/internship-status-history.entity';
import { IInternshipStatusHistoryRepository } from '../../application/ports/internship-status-history.repository.port';
import { InternshipStatusHistoryEntity } from '../database/entities/internship-status-history.entity';
import { InternshipStatusHistoryMapper } from '../mappers/internship-status-history.mapper';

@Injectable()
export class InternshipStatusHistoryRepository extends IInternshipStatusHistoryRepository {
  constructor(
    @InjectRepository(InternshipStatusHistoryEntity)
    private readonly historyRepository: Repository<InternshipStatusHistoryEntity>,
  ) {
    super();
  }

  async findByInternship(
    internshipId: string,
  ): Promise<InternshipStatusHistory[]> {
    const entities = await this.historyRepository.find({
      where: { internshipId },
      order: { changedAt: 'ASC' },
    });
    return entities.map(InternshipStatusHistoryMapper.toDomain);
  }

  async create(
    history: InternshipStatusHistory,
  ): Promise<InternshipStatusHistory> {
    const entity = InternshipStatusHistoryMapper.toPersistence(history);
    const saved = await this.historyRepository.save(entity);
    return InternshipStatusHistoryMapper.toDomain(saved);
  }
}

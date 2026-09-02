import { DailyLog } from '../../domain/entities/daily-log.entity';
import { DailyLogEntity } from '../database/entities/daily-log.entity';

export class DailyLogMapper {
  static toDomain(entity: DailyLogEntity): DailyLog {
    return new DailyLog(
      entity.id,
      entity.internshipId,
      new Date(entity.logDate),
      entity.content,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: DailyLog): DailyLogEntity {
    const entity = new DailyLogEntity();
    entity.id = domain.id;
    entity.internshipId = domain.internshipId;
    entity.logDate = domain.logDate;
    entity.content = domain.content;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}

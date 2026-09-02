import { InternshipStatusHistory } from '../../domain/entities/internship-status-history.entity';
import { InternshipStatusHistoryEntity } from '../database/entities/internship-status-history.entity';

export class InternshipStatusHistoryMapper {
  static toDomain(
    entity: InternshipStatusHistoryEntity,
  ): InternshipStatusHistory {
    return new InternshipStatusHistory(
      entity.id,
      entity.internshipId,
      entity.fromStatus,
      entity.toStatus,
      entity.reason,
      entity.changedBy,
      entity.changedAt,
    );
  }

  static toPersistence(
    domain: InternshipStatusHistory,
  ): InternshipStatusHistoryEntity {
    const entity = new InternshipStatusHistoryEntity();
    entity.id = domain.id;
    entity.internshipId = domain.internshipId;
    entity.fromStatus = domain.fromStatus;
    entity.toStatus = domain.toStatus;
    entity.reason = domain.reason;
    entity.changedBy = domain.changedBy;
    entity.changedAt = domain.changedAt;
    return entity;
  }
}

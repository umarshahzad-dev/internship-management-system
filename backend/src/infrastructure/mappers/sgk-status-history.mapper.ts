import { SgkStatusHistory } from '../../domain/entities/sgk-status-history.entity';
import { SgkStatusHistoryEntity } from '../database/entities/sgk-status-history.entity';

export class SgkStatusHistoryMapper {
  static toDomain(entity: SgkStatusHistoryEntity): SgkStatusHistory {
    return new SgkStatusHistory(
      entity.id,
      entity.sgkTrackingId,
      entity.fromStatus,
      entity.toStatus,
      entity.changedBy,
      entity.changedAt,
    );
  }

  static toPersistence(domain: SgkStatusHistory): SgkStatusHistoryEntity {
    const entity = new SgkStatusHistoryEntity();
    entity.id = domain.id;
    entity.sgkTrackingId = domain.sgkTrackingId;
    entity.fromStatus = domain.fromStatus;
    entity.toStatus = domain.toStatus;
    entity.changedBy = domain.changedBy;
    entity.changedAt = domain.changedAt;
    return entity;
  }
}

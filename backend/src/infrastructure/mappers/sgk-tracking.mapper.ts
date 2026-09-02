import { SgkTracking } from '../../domain/entities/sgk-tracking.entity';
import { SgkTrackingEntity } from '../database/entities/sgk-tracking.entity';

export class SgkTrackingMapper {
  static toDomain(entity: SgkTrackingEntity): SgkTracking {
    return new SgkTracking(
      entity.id,
      entity.internshipId,
      entity.status,
      entity.documentPath,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: SgkTracking): SgkTrackingEntity {
    const entity = new SgkTrackingEntity();
    entity.id = domain.id;
    entity.internshipId = domain.internshipId;
    entity.status = domain.status;
    entity.documentPath = domain.documentPath;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}

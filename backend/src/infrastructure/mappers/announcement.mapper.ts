import { Announcement } from '../../domain/entities/announcement.entity';
import { AnnouncementEntity } from '../database/entities/announcement.entity';

export class AnnouncementMapper {
  static toDomain(entity: AnnouncementEntity) { return new Announcement(entity.id, entity.title, entity.content, entity.targetRoles, entity.departmentId, entity.expiresAt, entity.isActive, entity.createdAt, entity.updatedAt); }
  static toPersistence(domain: Announcement) { const entity = new AnnouncementEntity(); entity.id = domain.id; entity.title = domain.title; entity.content = domain.content; entity.targetRoles = domain.targetRoles; entity.departmentId = domain.departmentId; entity.expiresAt = domain.expiresAt; entity.isActive = domain.isActive; entity.createdAt = domain.createdAt; entity.updatedAt = domain.updatedAt; return entity; }
}

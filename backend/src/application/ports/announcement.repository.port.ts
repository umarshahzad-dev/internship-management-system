import { Announcement } from '../../domain/entities/announcement.entity';
import { UserRole } from '../../domain/value-objects/role.vo';

export abstract class IAnnouncementRepository {
  abstract findById(id: string): Promise<Announcement | null>;
  abstract findAll(): Promise<Announcement[]>;
  abstract findActiveForUser(role: UserRole, departmentId: string | null, now: Date): Promise<Announcement[]>;
  abstract create(announcement: Announcement): Promise<Announcement>;
  abstract update(announcement: Announcement): Promise<Announcement>;
  abstract delete(id: string): Promise<void>;
}

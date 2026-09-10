import { Injectable } from '@nestjs/common';
import { AnnouncementInput } from './create-announcement.use-case';
import { Announcement } from '../../../domain/entities/announcement.entity';
import { IAnnouncementRepository } from '../../ports/announcement.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
@Injectable()
export class UpdateAnnouncementUseCase {
  constructor(private readonly repo: IAnnouncementRepository, private readonly dates: IDateProvider) {}
  async execute(id: string, input: Partial<AnnouncementInput>) { const current = await this.repo.findById(id); if (!current) throw new DomainException('NOT_FOUND', 'Announcement not found', 404); return this.repo.update(new Announcement(current.id, input.title ?? current.title, input.content ?? current.content, input.targetRoles ?? current.targetRoles, input.departmentId !== undefined ? input.departmentId : current.departmentId, input.expiresAt !== undefined ? input.expiresAt : current.expiresAt, input.isActive !== undefined ? input.isActive : current.isActive, current.createdAt, this.dates.now())); }
}

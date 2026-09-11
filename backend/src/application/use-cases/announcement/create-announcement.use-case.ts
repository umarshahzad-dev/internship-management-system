import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Announcement } from '../../../domain/entities/announcement.entity';
import { UserRole } from '../../../domain/value-objects/role.vo';
import { IAnnouncementRepository } from '../../ports/announcement.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface AnnouncementInput { title: string; content: string; targetRoles: UserRole[]; departmentId?: string | null; expiresAt?: Date | null; isActive?: boolean }
@Injectable()
export class CreateAnnouncementUseCase {
  constructor(private readonly repo: IAnnouncementRepository, private readonly dates: IDateProvider) {}
  execute(input: AnnouncementInput, role?: UserRole, callerDepartmentId?: string | null) { if (role === UserRole.ACADEMIC && (!callerDepartmentId || input.departmentId !== callerDepartmentId)) throw new DomainException('FORBIDDEN', 'Academics may only publish department announcements', 403); const now = this.dates.now(); return this.repo.create(new Announcement(randomUUID(), input.title, input.content, input.targetRoles, input.departmentId ?? null, input.expiresAt ?? null, input.isActive ?? true, now, now)); }
}

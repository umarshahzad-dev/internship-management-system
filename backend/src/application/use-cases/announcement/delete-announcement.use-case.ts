import { Injectable } from '@nestjs/common';
import { IAnnouncementRepository } from '../../ports/announcement.repository.port';
import { UserRole } from '../../../domain/value-objects/role.vo';
import { DomainException } from '../../../common/exceptions/domain.exception';
@Injectable()
export class DeleteAnnouncementUseCase { constructor(private readonly repo: IAnnouncementRepository) {} async execute(id: string, role?: UserRole, callerDepartmentId?: string | null) { const current = await this.repo.findById(id); if (!current) throw new DomainException('NOT_FOUND', 'Announcement not found', 404); if (role === UserRole.ACADEMIC && current.departmentId !== callerDepartmentId) throw new DomainException('FORBIDDEN', 'You may only delete your department announcements', 403); return this.repo.delete(id); } }

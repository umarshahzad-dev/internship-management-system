import { Injectable } from '@nestjs/common';
import { UserRole } from '../../../domain/value-objects/role.vo';
import { IAnnouncementRepository } from '../../ports/announcement.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
@Injectable()
export class ListAnnouncementsForUserUseCase { constructor(private readonly repo: IAnnouncementRepository, private readonly dates: IDateProvider) {} execute(role: UserRole, departmentId: string | null) { return this.repo.findActiveForUser(role, departmentId, this.dates.now()); } }

import { Injectable } from '@nestjs/common';
import { IAnnouncementRepository } from '../../ports/announcement.repository.port';
@Injectable()
export class ListAnnouncementsForAdminUseCase { constructor(private readonly repo: IAnnouncementRepository) {} execute() { return this.repo.findAll(); } }

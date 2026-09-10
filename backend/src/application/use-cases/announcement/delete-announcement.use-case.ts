import { Injectable } from '@nestjs/common';
import { IAnnouncementRepository } from '../../ports/announcement.repository.port';
@Injectable()
export class DeleteAnnouncementUseCase { constructor(private readonly repo: IAnnouncementRepository) {} execute(id: string) { return this.repo.delete(id); } }

import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { IFileStorage } from '../../ports/file-storage.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { ISgkTrackingRepository } from '../../ports/sgk-tracking.repository.port';
@Injectable()
export class DownloadSgkDocumentUseCase {
  constructor(private readonly sgk: ISgkTrackingRepository, private readonly internships: IInternshipRepository, private readonly storage: IFileStorage) {}
  async execute(id: string, departmentId: string) { const tracking = await this.sgk.findById(id); if (!tracking) throw new DomainException('NOT_FOUND', 'SGK tracking not found', 404); if (!tracking.documentPath) throw new DomainException('NOT_FOUND', 'SGK document not found', 404); const internship = await this.internships.findById(tracking.internshipId); if (!internship || internship.departmentId !== departmentId) throw new DomainException('FORBIDDEN', 'User cannot access SGK for other departments', 403); return { buffer: await this.storage.get(tracking.documentPath), filename: `sgk-${tracking.id}.pdf` }; }
}

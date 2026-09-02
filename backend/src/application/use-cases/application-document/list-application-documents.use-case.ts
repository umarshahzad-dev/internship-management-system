import { Injectable } from '@nestjs/common';
import { IApplicationDocumentRepository } from '../../ports/application-document.repository.port';
import { ApplicationDocumentStatus } from '../../../domain/enums/application-document-status.enum';

export interface ApplicationDocumentListItem {
  id: string;
  internshipId: string;
  documentTypeId: string;
  status: ApplicationDocumentStatus;
  versionNumber: number;
  originalFilename: string;
  rejectionReason: string | null;
  uploadedAt: string;
}

@Injectable()
export class ListApplicationDocumentsUseCase {
  constructor(
    private readonly applicationDocumentRepository: IApplicationDocumentRepository,
  ) {}

  async execute(internshipId: string): Promise<ApplicationDocumentListItem[]> {
    const documents =
      await this.applicationDocumentRepository.findLatestByInternship(
        internshipId,
      );

    return documents.map((doc) => ({
      id: doc.id,
      internshipId: doc.internshipId,
      documentTypeId: doc.documentTypeId,
      status: doc.status,
      versionNumber: doc.versionNumber,
      originalFilename: doc.originalFilename,
      rejectionReason: doc.rejectionReason,
      uploadedAt: doc.uploadedAt.toISOString(),
    }));
  }
}

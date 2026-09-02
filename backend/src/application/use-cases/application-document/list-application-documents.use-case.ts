import { Injectable } from '@nestjs/common';
import { IApplicationDocumentRepository } from '../../ports/application-document.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { ApplicationDocumentStatus } from '../../../domain/enums/application-document-status.enum';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

export interface ListApplicationDocumentsInput {
  internshipId: string;
  currentUserId: string;
  currentUserRole: string;
  currentUserDepartmentId: string | null;
}

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
    private readonly internshipRepository: IInternshipRepository,
  ) {}

  async execute(
    input: ListApplicationDocumentsInput,
  ): Promise<ApplicationDocumentListItem[]> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    // Authorization
    if (input.currentUserRole === 'STUDENT') {
      if (internship.studentId !== input.currentUserId) {
        throw new DomainException(
          'FORBIDDEN',
          'Only owner can view documents',
          403,
        );
      }
    } else if (input.currentUserRole === 'ACADEMIC') {
      if (
        !input.currentUserDepartmentId ||
        internship.departmentId !== input.currentUserDepartmentId
      ) {
        throw new DomainException(
          'FORBIDDEN',
          'Academic cannot view documents of other departments',
          403,
        );
      }
    }

    const documents =
      await this.applicationDocumentRepository.findLatestByInternship(
        input.internshipId,
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

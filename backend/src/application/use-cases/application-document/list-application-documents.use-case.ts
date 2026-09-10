import { Injectable, Optional } from '@nestjs/common';
import { IApplicationDocumentRepository } from '../../ports/application-document.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { ApplicationDocumentStatus } from '../../../domain/enums/application-document-status.enum';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';
import { IDocumentTypeRepository } from '../../ports/document-type.repository.port';

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
  documentTypeName?: string;
  documentTypeIsRequired?: boolean;
  documentTypeSource?: string;
}

@Injectable()
export class ListApplicationDocumentsUseCase {
  constructor(
    private readonly applicationDocumentRepository: IApplicationDocumentRepository,
    private readonly internshipRepository: IInternshipRepository,
    @Optional() private readonly documentTypeRepository?: IDocumentTypeRepository,
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
          'User cannot view documents of other departments',
          403,
        );
      }
    } else {
      throw new DomainException(
        'FORBIDDEN',
        'Insufficient permissions',
        403,
      );
    }

    const documents =
      await this.applicationDocumentRepository.findLatestByInternship(
        input.internshipId,
      );

    return Promise.all(
      documents.map(async (doc) => {
        const type = await this.documentTypeRepository?.findById(
          doc.documentTypeId,
        );
        return {
          id: doc.id,
          internshipId: doc.internshipId,
          documentTypeId: doc.documentTypeId,
          status: doc.status,
          versionNumber: doc.versionNumber,
          originalFilename: doc.originalFilename,
          rejectionReason: doc.rejectionReason,
          uploadedAt: doc.uploadedAt.toISOString(),
          documentTypeName: type?.name,
          documentTypeIsRequired: type?.isRequired,
          documentTypeSource: type?.source,
        };
      }),
    );
  }
}

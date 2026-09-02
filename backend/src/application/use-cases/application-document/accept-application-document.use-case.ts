import { Injectable } from '@nestjs/common';
import { ApplicationDocument } from '../../../domain/entities/application-document.entity';
import { ApplicationDocumentStatus } from '../../../domain/enums/application-document-status.enum';
import { IApplicationDocumentRepository } from '../../ports/application-document.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface AcceptApplicationDocumentInput {
  documentId: string;
  academicId: string;
  academicDepartmentId: string;
}

@Injectable()
export class AcceptApplicationDocumentUseCase {
  constructor(
    private readonly applicationDocumentRepository: IApplicationDocumentRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: AcceptApplicationDocumentInput): Promise<void> {
    const document = await this.applicationDocumentRepository.findById(
      input.documentId,
    );
    if (!document) {
      throw new DomainException(
        'NOT_FOUND',
        'Application document not found',
        404,
      );
    }

    const internship = await this.internshipRepository.findById(
      document.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.departmentId !== input.academicDepartmentId) {
      throw new DomainException(
        'FORBIDDEN',
        'Academic cannot review documents of other departments',
        403,
      );
    }

    if (document.status !== ApplicationDocumentStatus.PENDING) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Only pending documents can be accepted',
        409,
      );
    }

    const now = this.dateProvider.now();
    const accepted = new ApplicationDocument(
      document.id,
      document.internshipId,
      document.documentTypeId,
      document.filePath,
      document.originalFilename,
      ApplicationDocumentStatus.ACCEPTED,
      null,
      document.versionNumber,
      document.uploadedAt,
      now,
    );

    await this.applicationDocumentRepository.update(accepted);
  }
}

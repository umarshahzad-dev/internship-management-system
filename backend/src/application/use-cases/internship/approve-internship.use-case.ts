import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IInternshipStatusHistoryRepository } from '../../ports/internship-status-history.repository.port';
import { IApplicationDocumentRepository } from '../../ports/application-document.repository.port';
import { IDocumentTypeRepository } from '../../ports/document-type.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatusHistory } from '../../../domain/entities/internship-status-history.entity';
import { DocumentSource } from '../../../domain/enums/document-source.enum';

@Injectable()
export class ApproveInternshipUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly historyRepository: IInternshipStatusHistoryRepository,
    private readonly applicationDocumentRepository: IApplicationDocumentRepository,
    private readonly documentTypeRepository: IDocumentTypeRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(internshipId: string, academicId: string): Promise<void> {
    const internship = await this.internshipRepository.findById(internshipId);
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    const oldStatus = internship.status;

    // 1. Required documents check (Bypass SYSTEM_GENERATED docs as they are created later)
    const requiredDocTypes = await this.documentTypeRepository.findByDepartment(
      internship.departmentId,
    );
    const acceptedDocs =
      await this.applicationDocumentRepository.findAcceptedByInternship(
        internship.id,
      );
    const acceptedTypeIds = new Set(
      acceptedDocs.map((doc) => doc.documentTypeId),
    );

    for (const requiredType of requiredDocTypes.filter(
      (dt) => dt.isRequired && dt.source === DocumentSource.EXTERNAL_UPLOAD,
    )) {
      if (!acceptedTypeIds.has(requiredType.id)) {
        throw new DomainException(
          'REQUIRED_DOCUMENTS_MISSING',
          `Missing accepted document for type: ${requiredType.name}`,
          409,
        );
      }
    }

    // 2. Advance State (This internally enforces the PENDING_COMMISSION state check)
    const now = this.dateProvider.now();
    internship.commissionApprove(academicId, now);

    // 3. Persist State
    await this.internshipRepository.update(internship);

    // 4. Log History
    const history = new InternshipStatusHistory(
      randomUUID(),
      internship.id,
      oldStatus,
      internship.status,
      null,
      academicId,
      now,
    );
    await this.historyRepository.create(history);
  }
}

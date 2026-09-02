import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Internship } from '../../../domain/entities/internship.entity';
import { InternshipStatusHistory } from '../../../domain/entities/internship-status-history.entity';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IInternshipStatusHistoryRepository } from '../../ports/internship-status-history.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

@Injectable()
export class ApproveInternshipUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly historyRepository: IInternshipStatusHistoryRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(internshipId: string, academicId: string): Promise<void> {
    const internship = await this.internshipRepository.findById(internshipId);
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (
      internship.status !== InternshipStatus.APPLIED &&
      internship.status !== InternshipStatus.REVISION
    ) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Only applied or revision applications can be approved',
        409,
      );
    }

    const now = this.dateProvider.now();
    const updated = new Internship(
      internship.id,
      internship.departmentId,
      internship.studentId,
      internship.companyId,
      InternshipStatus.APPROVED,
      internship.startDate,
      internship.endDate,
      internship.gradingData,
      true, // lock
      now, // approvedAt
      academicId,
      internship.createdAt,
      now,
    );

    await this.internshipRepository.update(updated);

    const history = new InternshipStatusHistory(
      randomUUID(),
      internship.id,
      internship.status,
      InternshipStatus.APPROVED,
      null,
      academicId,
      now,
    );
    await this.historyRepository.create(history);
  }
}

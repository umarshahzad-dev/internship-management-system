import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Internship } from '../../../domain/entities/internship.entity';
import { InternshipStatusHistory } from '../../../domain/entities/internship-status-history.entity';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IInternshipStatusHistoryRepository } from '../../ports/internship-status-history.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

export interface RequestRevisionInternshipInput {
  internshipId: string;
  academicId: string;
  reason: string;
}

@Injectable()
export class RequestRevisionInternshipUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly historyRepository: IInternshipStatusHistoryRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: RequestRevisionInternshipInput): Promise<void> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.status !== InternshipStatus.APPLIED) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Only applied applications can request revision',
        409,
      );
    }

    const now = this.dateProvider.now();
    const updated = new Internship(
      internship.id,
      internship.departmentId,
      internship.studentId,
      internship.companyId,
      InternshipStatus.REVISION,
      internship.startDate,
      internship.endDate,
      internship.gradingData,
      false,
      null,
      null,
      internship.createdAt,
      now,
    );

    await this.internshipRepository.update(updated);

    const history = new InternshipStatusHistory(
      randomUUID(),
      internship.id,
      internship.status,
      InternshipStatus.REVISION,
      input.reason,
      input.academicId,
      now,
    );
    await this.historyRepository.create(history);
  }
}

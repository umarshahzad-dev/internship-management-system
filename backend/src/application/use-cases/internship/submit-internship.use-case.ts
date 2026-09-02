import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Internship } from '../../../domain/entities/internship.entity';
import { InternshipStatusHistory } from '../../../domain/entities/internship-status-history.entity';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IInternshipStatusHistoryRepository } from '../../ports/internship-status-history.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

export interface SubmitInternshipInput {
  internshipId: string;
  currentUserId: string;
}

@Injectable()
export class SubmitInternshipUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly historyRepository: IInternshipStatusHistoryRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: SubmitInternshipInput): Promise<void> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.studentId !== input.currentUserId) {
      throw new DomainException('FORBIDDEN', 'Only owner can submit', 403);
    }

    if (
      internship.status !== InternshipStatus.DRAFT &&
      internship.status !== InternshipStatus.REVISION
    ) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Only draft or revision applications can be submitted',
        409,
      );
    }

    if (internship.locked) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Internship is locked',
        409,
      );
    }

    const now = this.dateProvider.now();
    const updated = new Internship(
      internship.id,
      internship.departmentId,
      internship.studentId,
      internship.companyId,
      InternshipStatus.APPLIED,
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
      InternshipStatus.APPLIED,
      null,
      input.currentUserId,
      now,
    );
    await this.historyRepository.create(history);
  }
}

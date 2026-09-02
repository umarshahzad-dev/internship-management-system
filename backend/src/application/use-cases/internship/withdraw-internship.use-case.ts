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
export class WithdrawInternshipUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly historyRepository: IInternshipStatusHistoryRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(internshipId: string, currentUserId: string): Promise<void> {
    const internship = await this.internshipRepository.findById(internshipId);
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.studentId !== currentUserId) {
      throw new DomainException('FORBIDDEN', 'Only owner can withdraw', 403);
    }

    if (
      internship.status === InternshipStatus.APPROVED ||
      internship.status === InternshipStatus.ONGOING ||
      internship.status === InternshipStatus.EVALUATION ||
      internship.status === InternshipStatus.GRADED ||
      internship.status === InternshipStatus.COMPLETED
    ) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Cannot withdraw after approval',
        409,
      );
    }

    const now = this.dateProvider.now();
    const updated = new Internship(
      internship.id,
      internship.departmentId,
      internship.studentId,
      internship.companyId,
      InternshipStatus.WITHDRAWN,
      internship.startDate,
      internship.endDate,
      internship.gradingData,
      true, // terminal, lock
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
      InternshipStatus.WITHDRAWN,
      null,
      currentUserId,
      now,
    );
    await this.historyRepository.create(history);
  }
}

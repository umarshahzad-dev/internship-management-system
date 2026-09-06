import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IInternshipStatusHistoryRepository } from '../../ports/internship-status-history.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatusHistory } from '../../../domain/entities/internship-status-history.entity';

export interface FinalizeInternshipInput {
  internshipId: string;
  userId: string;
  departmentId: string;
}

@Injectable()
export class FinalizeInternshipUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly historyRepository: IInternshipStatusHistoryRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: FinalizeInternshipInput): Promise<void> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship)
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);

    if (internship.departmentId !== input.departmentId) {
      throw new DomainException(
        'FORBIDDEN',
        'User cannot manage internships of other departments',
        403,
      );
    }

    const oldStatus = internship.status;
    const now = this.dateProvider.now();

    internship.finalize(now);
    await this.internshipRepository.update(internship);

    const history = new InternshipStatusHistory(
      randomUUID(),
      internship.id,
      oldStatus,
      internship.status,
      null,
      input.userId,
      now,
    );
    await this.historyRepository.create(history);
  }
}

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Internship } from '../../../domain/entities/internship.entity';
import { InternshipStatusHistory } from '../../../domain/entities/internship-status-history.entity';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';
import { SgkStatus } from '../../../domain/enums/sgk-status.enum';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IInternshipStatusHistoryRepository } from '../../ports/internship-status-history.repository.port';
import { ISgkTrackingRepository } from '../../ports/sgk-tracking.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface TransitionToOngoingInput {
  internshipId: string;
  academicId: string;
  academicDepartmentId: string;
}

@Injectable()
export class TransitionToOngoingUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly internshipHistoryRepository: IInternshipStatusHistoryRepository,
    private readonly sgkTrackingRepository: ISgkTrackingRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: TransitionToOngoingInput): Promise<void> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.departmentId !== input.academicDepartmentId) {
      throw new DomainException(
        'FORBIDDEN',
        'Academic cannot manage internships of other departments',
        403,
      );
    }

    if (internship.status !== InternshipStatus.APPROVED_PENDING_SGK) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Only approved internships pending SGK can transition to ongoing',
        409,
      );
    }

    const sgk = await this.sgkTrackingRepository.findByInternship(
      input.internshipId,
    );
    if (!sgk || sgk.status !== SgkStatus.ACTIVE) {
      throw new DomainException(
        'SGK_NOT_ACTIVE',
        'SGK status must be ACTIVE before starting internship',
        409,
      );
    }

    const now = this.dateProvider.now();
    if (now < internship.startDate) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Current date is before internship start date',
        409,
      );
    }

    const updated = new Internship(
      internship.id,
      internship.departmentId,
      internship.studentId,
      internship.companyId,
      InternshipStatus.ONGOING,
      internship.startDate,
      internship.endDate,
      internship.gradingData,
      internship.locked,
      internship.approvedAt,
      internship.approvedBy,
      internship.createdAt,
      now,
      internship.employerApprovalIp,
      internship.employerApprovalTimestamp,
      internship.commissionApprovalUserId,
      internship.commissionApprovalTimestamp,
    );
    await this.internshipRepository.update(updated);

    const history = new InternshipStatusHistory(
      randomUUID(),
      internship.id,
      internship.status,
      InternshipStatus.ONGOING,
      null,
      input.academicId,
      now,
    );
    await this.internshipHistoryRepository.create(history);
  }
}

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SgkTracking } from '../../../domain/entities/sgk-tracking.entity';
import { SgkStatusHistory } from '../../../domain/entities/sgk-status-history.entity';
import { SgkStatus } from '../../../domain/enums/sgk-status.enum';
import { ISgkTrackingRepository } from '../../ports/sgk-tracking.repository.port';
import { ISgkStatusHistoryRepository } from '../../ports/sgk-status-history.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface UpdateSgkStatusInput {
  sgkTrackingId: string;
  newStatus: SgkStatus;
  academicId: string;
  academicDepartmentId: string;
}

export interface UpdateSgkStatusResult {
  id: string;
  internshipId: string;
  status: SgkStatus;
  documentPath: string | null;
}

@Injectable()
export class UpdateSgkStatusUseCase {
  constructor(
    private readonly sgkTrackingRepository: ISgkTrackingRepository,
    private readonly historyRepository: ISgkStatusHistoryRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: UpdateSgkStatusInput): Promise<UpdateSgkStatusResult> {
    const tracking = await this.sgkTrackingRepository.findById(
      input.sgkTrackingId,
    );
    if (!tracking) {
      throw new DomainException('NOT_FOUND', 'SGK tracking not found', 404);
    }

    const internship = await this.internshipRepository.findById(
      tracking.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.departmentId !== input.academicDepartmentId) {
      throw new DomainException(
        'FORBIDDEN',
        'User cannot manage SGK for other departments',
        403,
      );
    }

    // Validate transition
    const allowed =
      (tracking.status === SgkStatus.PENDING &&
        input.newStatus === SgkStatus.SUBMITTED) ||
      (tracking.status === SgkStatus.SUBMITTED &&
        input.newStatus === SgkStatus.ACTIVE);
    if (!allowed) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        `Cannot transition from ${tracking.status} to ${input.newStatus}`,
        409,
      );
    }

    const now = this.dateProvider.now();
    const updatedTracking = new SgkTracking(
      tracking.id,
      tracking.internshipId,
      input.newStatus,
      tracking.documentPath,
      tracking.createdAt,
      now,
    );
    const saved = await this.sgkTrackingRepository.update(updatedTracking);

    const history = new SgkStatusHistory(
      randomUUID(),
      tracking.id,
      tracking.status,
      input.newStatus,
      input.academicId,
      now,
    );
    await this.historyRepository.create(history);

    return {
      id: saved.id,
      internshipId: saved.internshipId,
      status: saved.status,
      documentPath: saved.documentPath,
    };
  }
}

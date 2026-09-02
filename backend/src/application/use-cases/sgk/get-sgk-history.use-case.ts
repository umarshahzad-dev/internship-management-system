import { Injectable } from '@nestjs/common';
import { ISgkTrackingRepository } from '../../ports/sgk-tracking.repository.port';
import { ISgkStatusHistoryRepository } from '../../ports/sgk-status-history.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { SgkStatus } from '../../../domain/enums/sgk-status.enum';

export interface SgkHistoryItem {
  id: string;
  sgkTrackingId: string;
  fromStatus: SgkStatus;
  toStatus: SgkStatus;
  changedBy: string | null;
  changedAt: string;
}

@Injectable()
export class GetSgkHistoryUseCase {
  constructor(
    private readonly sgkTrackingRepository: ISgkTrackingRepository,
    private readonly historyRepository: ISgkStatusHistoryRepository,
    private readonly internshipRepository: IInternshipRepository,
  ) {}

  async execute(
    sgkTrackingId: string,
    academicDepartmentId: string,
  ): Promise<SgkHistoryItem[]> {
    const tracking = await this.sgkTrackingRepository.findById(sgkTrackingId);
    if (!tracking) {
      throw new DomainException('NOT_FOUND', 'SGK tracking not found', 404);
    }

    const internship = await this.internshipRepository.findById(
      tracking.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.departmentId !== academicDepartmentId) {
      throw new DomainException(
        'FORBIDDEN',
        'Academic cannot view SGK history of other departments',
        403,
      );
    }

    const history =
      await this.historyRepository.findBySgkTracking(sgkTrackingId);
    return history.map((item) => ({
      id: item.id,
      sgkTrackingId: item.sgkTrackingId,
      fromStatus: item.fromStatus,
      toStatus: item.toStatus,
      changedBy: item.changedBy,
      changedAt: item.changedAt.toISOString(),
    }));
  }
}

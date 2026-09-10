import { Injectable } from '@nestjs/common';
import { IInternshipStatusHistoryRepository } from '../../ports/internship-status-history.repository.port';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface HistoryItem {
  id: string;
  internshipId: string;
  fromStatus: InternshipStatus;
  toStatus: InternshipStatus;
  reason: string | null;
  changedBy: string | null;
  changedAt: string;
}

export interface GetInternshipHistoryInput {
  internshipId: string;
  currentUserId: string;
  currentUserRole: string;
  currentUserDepartmentId: string | null;
}

@Injectable()
export class GetInternshipHistoryUseCase {
  constructor(
    private readonly historyRepository: IInternshipStatusHistoryRepository,
    private readonly internshipRepository: IInternshipRepository,
  ) {}

  async execute(input: GetInternshipHistoryInput): Promise<HistoryItem[]> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }
    if (
      input.currentUserRole === 'STUDENT' &&
      internship.studentId !== input.currentUserId
    ) {
      throw new DomainException('FORBIDDEN', 'Access denied', 403);
    }
    if (
      input.currentUserRole === 'ACADEMIC' &&
      internship.departmentId !== input.currentUserDepartmentId
    ) {
      throw new DomainException('FORBIDDEN', 'Access denied', 403);
    }
    if (
      input.currentUserRole !== 'STUDENT' &&
      input.currentUserRole !== 'ACADEMIC'
    ) {
      throw new DomainException('FORBIDDEN', 'Access denied', 403);
    }

    const history = await this.historyRepository.findByInternship(
      input.internshipId,
    );
    return history.map((item) => ({
      id: item.id,
      internshipId: item.internshipId,
      fromStatus: item.fromStatus,
      toStatus: item.toStatus,
      reason: item.reason,
      changedBy: item.changedBy,
      changedAt: item.changedAt.toISOString(),
    }));
  }
}

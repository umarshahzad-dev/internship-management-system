import { Injectable } from '@nestjs/common';
import { IInternshipStatusHistoryRepository } from '../../ports/internship-status-history.repository.port';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

export interface HistoryItem {
  id: string;
  internshipId: string;
  fromStatus: InternshipStatus;
  toStatus: InternshipStatus;
  reason: string | null;
  changedBy: string | null;
  changedAt: string;
}

@Injectable()
export class GetInternshipHistoryUseCase {
  constructor(
    private readonly historyRepository: IInternshipStatusHistoryRepository,
  ) {}

  async execute(internshipId: string): Promise<HistoryItem[]> {
    const history = await this.historyRepository.findByInternship(internshipId);
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

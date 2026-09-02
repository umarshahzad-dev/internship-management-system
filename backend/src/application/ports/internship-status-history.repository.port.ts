import { InternshipStatusHistory } from '../../domain/entities/internship-status-history.entity';

export abstract class IInternshipStatusHistoryRepository {
  abstract findByInternship(
    internshipId: string,
  ): Promise<InternshipStatusHistory[]>;
  abstract create(
    history: InternshipStatusHistory,
  ): Promise<InternshipStatusHistory>;
}

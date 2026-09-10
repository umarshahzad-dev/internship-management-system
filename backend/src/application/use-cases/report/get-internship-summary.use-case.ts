import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { IReportRepository, InternshipSummary } from '../../ports/report.repository.port';

@Injectable()
export class GetInternshipSummaryUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  execute(role: string): Promise<InternshipSummary> {
    if (role !== 'ADMIN') throw new DomainException('FORBIDDEN', 'Only administrators can view global statistics', 403);
    return this.reportRepository.getInternshipSummary();
  }
}

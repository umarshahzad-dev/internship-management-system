import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { AdminDashboardSummary, IReportRepository } from '../../ports/report.repository.port';
@Injectable()
export class GetAdminDashboardSummaryUseCase {
  constructor(private readonly reports: IReportRepository) {}
  execute(role: string): Promise<AdminDashboardSummary> { if (role !== 'ADMIN') throw new DomainException('FORBIDDEN', 'Only administrators can view global statistics', 403); return this.reports.getAdminDashboardSummary(); }
}

import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { AdminCompanyFilters, AdminCompanyRow, IReportRepository } from '../../ports/report.repository.port';

@Injectable()
export class ListAdminCompaniesUseCase {
  constructor(private readonly reports: IReportRepository) {}

  execute(role: string, filters: AdminCompanyFilters): Promise<{ items: AdminCompanyRow[]; total: number; page: number; pageSize: number }> {
    if (role !== 'ADMIN') throw new DomainException('FORBIDDEN', 'Only administrators can view the full company directory', 403);
    return this.reports.getAdminCompanies(filters);
  }
}

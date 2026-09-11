import { Controller, Get, NotFoundException, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../../domain/value-objects/role.vo';
import { GetAdminDashboardSummaryUseCase } from '../../application/use-cases/admin/get-admin-dashboard-summary.use-case';
import { GenerateAdminReportUseCase } from '../../application/use-cases/admin/generate-admin-report.use-case';
import { IReportRepository } from '../../application/ports/report.repository.port';
import { ListAdminCompaniesUseCase } from '../../application/use-cases/company/list-admin-companies.use-case';

const fileSlug = (value: string) => value
  .replace(/[ıİğĞüÜşŞöÖçÇ]/g, (character) => ({ ı: 'i', İ: 'I', ğ: 'g', Ğ: 'G', ü: 'u', Ü: 'U', ş: 's', Ş: 'S', ö: 'o', Ö: 'O', ç: 'c', Ç: 'C' }[character] ?? character))
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly summary: GetAdminDashboardSummaryUseCase,
    private readonly report: GenerateAdminReportUseCase,
    private readonly reports: IReportRepository,
    private readonly companies: ListAdminCompaniesUseCase,
  ) {}

  @Get('dashboard-summary')
  @Roles(UserRole.ADMIN)
  dashboardSummary(@Req() req: AuthenticatedRequest, @Query('departmentId') departmentId?: string) {
    return this.summary.execute(req.user!.role, departmentId);
  }

  @Get('historical-terms')
  @Roles(UserRole.ADMIN)
  historicalTerms() { return this.reports.getHistoricalTerms(); }

  @Get('reports/current-term')
  @Roles(UserRole.ADMIN)
  async currentReport(@Req() req: AuthenticatedRequest, @Query('departmentId') departmentId: string | undefined, @Res() res: Response) {
    const buffer = await this.report.execute(req.user!.role, departmentId);
    const summary = await this.summary.execute(req.user!.role, departmentId);
    const scope = departmentId ? 'Bolum' : 'TumUniversite';
    const termName = fileSlug(summary.term?.name ?? 'Aktif-Donem');
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="KTUN_IMAS_Rapor_${scope}_${termName}.xlsx"`, 'Content-Length': buffer.length.toString() });
    res.end(buffer);
  }

  @Get('reports/historical/:termId')
  @Roles(UserRole.ADMIN)
  async historicalReport(@Req() req: AuthenticatedRequest, @Param('termId') termId: string, @Res() res: Response) {
    const terms = await this.reports.getHistoricalTerms();
    if (!terms.some((term) => term.id === termId)) throw new NotFoundException('Historical term data was not found');
    const buffer = await this.report.execute(req.user!.role, undefined, termId);
    const termName = fileSlug(terms.find((term) => term.id === termId)?.name ?? 'Arsiv');
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="KTUN_IMAS_Rapor_Arsiv_${termName}.xlsx"`, 'Content-Length': buffer.length.toString() });
    res.end(buffer);
  }

  @Get('internships')
  @Roles(UserRole.ADMIN)
  adminInternships(@Query('status') status?: string, @Query('departmentId') departmentId?: string, @Query('termId') termId?: string, @Query('term') term?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.reports.getAdminInternships({ status, departmentId, termId, term, page: Number(page) || 1, pageSize: Number(pageSize) || 20 });
  }

  @Get('internships/:id')
  @Roles(UserRole.ADMIN)
  async adminInternshipDetail(@Param('id') id: string) {
    const item = await this.reports.getAdminInternshipDetail(id);
    if (!item) throw new NotFoundException('Internship not found');
    return item;
  }

  @Get('companies')
  @Roles(UserRole.ADMIN)
  adminCompanies(
    @Req() req: AuthenticatedRequest,
    @Query('termActive') termActive?: string,
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('industry') industry?: string,
    @Query('isVerified') isVerified?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.companies.execute(req.user!.role, {
      termActive: termActive === 'true',
      search,
      city,
      industry,
      isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20,
    });
  }
}

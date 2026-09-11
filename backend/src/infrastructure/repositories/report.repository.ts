import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  IReportRepository,
  InternshipReportFilter,
  InternshipReportRow,
  InternshipSummary,
  AdminDashboardSummary,
  HistoricalTerm,
  AdminInternshipRow,
  AdminReportData,
  AdminCompanyFilters,
  AdminCompanyRow,
} from '../../application/ports/report.repository.port';
import { InternshipStatus } from '../../domain/enums/internship-status.enum';

export function parseAdminStatusFilter(value?: string): string[] {
  return [...new Set((value ?? '').split(',').map((status) => status.trim()).filter(Boolean).map((status) => status === 'ACTIVE' ? 'ONGOING' : status))];
}

function deriveTermRange(academicYear?: string, semester?: string): { start: string; end: string } | null {
  const match = academicYear?.match(/^(\d{4})-(\d{4})$/);
  if (!match) return null;
  const startYear = Number(match[1]);
  const endYear = Number(match[2]);
  const normalized = (semester ?? '').toLocaleUpperCase('tr-TR');
  if (normalized.includes('BAHAR') || normalized.includes('SPRING')) return { start: `${endYear}-02-01`, end: `${endYear}-08-31` };
  if (normalized.includes('GÜZ') || normalized.includes('GUZ') || normalized.includes('FALL')) return { start: `${startYear}-09-01`, end: `${endYear}-01-31` };
  return { start: `${startYear}-06-01`, end: `${startYear}-08-31` };
}

@Injectable()
export class ReportRepository implements IReportRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getInternshipData(
    filters: InternshipReportFilter,
  ): Promise<InternshipReportRow[]> {
    const query = this.dataSource
      .createQueryBuilder()
      .select('u.student_number', 'studentNumber')
      .addSelect("concat(u.first_name, ' ', u.last_name)", 'studentName')
      .addSelect('d.name', 'departmentName')
      .addSelect('c.name', 'companyName')
      .addSelect("to_char(i.start_date, 'YYYY-MM-DD')", 'startDate')
      .addSelect("to_char(i.end_date, 'YYYY-MM-DD')", 'endDate')
      .addSelect('i.status', 'status')
      .addSelect(
        "coalesce(ee.grades->'attendance'->>'score', 'N/A')",
        'employerGrade',
      )
      .from('internships', 'i')
      .innerJoin('users', 'u', 'u.id = i.student_id')
      .innerJoin('departments', 'd', 'd.id = i.department_id')
      .innerJoin('companies', 'c', 'c.id = i.company_id')
      .leftJoin('employer_evaluations', 'ee', 'ee.internship_id = i.id');

    if (filters.status) {
      query.andWhere('i.status = :status', { status: filters.status });
    }
    if (filters.departmentId) {
      query.andWhere('i.department_id = :departmentId', {
        departmentId: filters.departmentId,
      });
    }

    // Large exports should move to a background job; cap synchronous responses for now.
    if (filters.limit) query.limit(Math.min(Math.max(filters.limit, 1), 10000));

    return query.getRawMany<InternshipReportRow>();
  }

  async getInternshipSummary(): Promise<InternshipSummary> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'totalApplications')
      .addSelect("COUNT(*) FILTER (WHERE i.status IN ('PENDING_EMPLOYER', 'PENDING_COMMISSION', 'APPROVED_PENDING_SGK', 'EVALUATION'))", 'pendingApplications')
      .addSelect("COUNT(*) FILTER (WHERE i.status IN ('GRADED', 'COMPLETED'))", 'completedApplications')
      .from('internships', 'i')
      .getRawOne<{ totalApplications: string; pendingApplications: string; completedApplications: string }>();
    return {
      totalApplications: Number(result?.totalApplications ?? 0),
      pendingApplications: Number(result?.pendingApplications ?? 0),
      completedApplications: Number(result?.completedApplications ?? 0),
    };
  }

  async getAdminDashboardSummary(departmentId?: string): Promise<AdminDashboardSummary> {
    const configRows = await this.dataSource.createQueryBuilder().select('key').addSelect('value').from('system_configs', 'c').where('key IN (:...keys)', { keys: ['ACADEMIC_YEAR', 'ACTIVE_SEMESTER'] }).getRawMany<{ key: string; value: string }>();
    const config = Object.fromEntries(configRows.map((row) => [row.key, row.value]));
    const termRange = deriveTermRange(config.ACADEMIC_YEAR, config.ACTIVE_SEMESTER);
    const termName = [config.ACADEMIC_YEAR, config.ACTIVE_SEMESTER].filter(Boolean).join(' ');
    const term = await this.dataSource.createQueryBuilder().select('id').addSelect('term_name', 'name').from('academic_calendars', 'cal').where('term_name ILIKE :term', { term: `%${config.ACADEMIC_YEAR ?? ''}%` }).orderBy('application_end', 'DESC').limit(1).getRawOne<{ id: string; name: string }>();
    const scoped = (query: ReturnType<DataSource['createQueryBuilder']>) => {
      if (departmentId) query.andWhere('i.department_id = :dashboardDepartmentId', { dashboardDepartmentId: departmentId });
      if (termRange) query.andWhere('i.start_date BETWEEN :dashboardTermStart AND :dashboardTermEnd', { dashboardTermStart: termRange.start, dashboardTermEnd: termRange.end });
      return query;
    };
    const statuses = ['DRAFT', 'PENDING_EMPLOYER', 'PENDING_COMMISSION', 'APPROVED_PENDING_SGK', 'ONGOING', 'EVALUATION', 'GRADED', 'COMPLETED', 'REVISION', 'REJECTED'];
    const labels: Record<string, string> = { DRAFT: 'Öğrenci Başvuru Taslağı', PENDING_EMPLOYER: 'Firma Kabul Belgesi İncelemesi', PENDING_COMMISSION: 'Bölüm Ön Kontrol / Komisyon Onayı Bekleyen', APPROVED_PENDING_SGK: 'SGK Giriş Onayı Bekleyen', ONGOING: 'Aktif Devam Eden Staj', EVALUATION: 'Staj Defteri Değerlendirme', GRADED: 'Notlandırıldı', COMPLETED: 'Arşivlendi / Tamamlandı', REVISION: 'Revizyon Bekleyen', REJECTED: 'Reddedildi' };
    const statusRows = await scoped(this.dataSource.createQueryBuilder().select('i.status', 'status').addSelect('COUNT(*)', 'total').from('internships', 'i')).groupBy('i.status').getRawMany<{ status: string; total: string }>();
    const counts = Object.fromEntries(statusRows.map((row) => [row.status, Number(row.total)]));
    const totals = await scoped(this.dataSource.createQueryBuilder().select('COUNT(*)', 'total').from('internships', 'i')).getRawOne<{ total: string }>();
    const pendingSgk = await scoped(this.dataSource.createQueryBuilder().select('COUNT(*)', 'total').from('internships', 'i').where('i.status = :sgk', { sgk: InternshipStatus.APPROVED_PENDING_SGK })).getRawOne<{ total: string }>();
    // The persisted workflow enum uses ONGOING; ACTIVE is a frontend alias only.
    const active = await scoped(this.dataSource.createQueryBuilder().select('COUNT(*)', 'total').from('internships', 'i').where('i.status = :activeStatus', { activeStatus: 'ONGOING' })).getRawOne<{ total: string }>();
    const completed = await scoped(this.dataSource.createQueryBuilder().select('COUNT(*)', 'total').from('internships', 'i').where('i.status IN (:...completedStatuses)', { completedStatuses: ['GRADED', 'COMPLETED'] })).getRawOne<{ total: string }>();
    const activeCompanies = await scoped(this.dataSource.createQueryBuilder().select('COUNT(DISTINCT i.company_id)', 'total').from('internships', 'i').where('i.status = :activeCompanyStatus', { activeCompanyStatus: 'ONGOING' })).getRawOne<{ total: string }>();
    const registeredCompanies = await this.dataSource.createQueryBuilder().select('COUNT(*)', 'total').from('companies', 'c').getRawOne<{ total: string }>();
    const pendingActions = await scoped(this.dataSource.createQueryBuilder().select('COUNT(*)', 'total').from('internships', 'i').where('i.status IN (:...pendingStatuses)', { pendingStatuses: ['PENDING_EMPLOYER', 'PENDING_COMMISSION'] })).getRawOne<{ total: string }>();
    const rejected = await scoped(this.dataSource.createQueryBuilder().select('COUNT(*)', 'total').from('internships', 'i').where('i.status IN (:...rejectedStatuses)', { rejectedStatuses: ['REJECTED', 'REVISION', 'REVISION_REQUESTED'] })).getRawOne<{ total: string }>();
    const users = await this.dataSource.createQueryBuilder().select('COUNT(*)', 'total').from('users', 'u').where('u.is_active = true').getRawOne<{ total: string }>();
    const statusDistribution = statuses.map((status) => ({ status, label: labels[status] ?? status, count: counts[status] ?? 0 }));
    const departmentDistribution = departmentId ? [] : await this.dataSource.createQueryBuilder().select('d.id', 'departmentId').addSelect('d.name', 'name').addSelect('COUNT(i.id)', 'total').addSelect("COUNT(i.id) FILTER (WHERE i.status = 'ONGOING')", 'active').addSelect("COUNT(i.id) FILTER (WHERE i.status IN ('GRADED','COMPLETED'))", 'completed').from('departments', 'd').leftJoin('internships', 'i', `i.department_id = d.id${termRange ? ' AND i.start_date BETWEEN :departmentTermStart AND :departmentTermEnd' : ''}`, termRange ? { departmentTermStart: termRange.start, departmentTermEnd: termRange.end } : {}).groupBy('d.id').addGroupBy('d.name').orderBy('d.name', 'ASC').getRawMany<{ departmentId: string; name: string; total: string; active: string; completed: string }>().then((rows) => rows.map((row) => ({ departmentId: row.departmentId, name: row.name, total: Number(row.total), active: Number(row.active), completed: Number(row.completed) })));
    const warnings: string[] = [];
    const staleSgk = await scoped(this.dataSource.createQueryBuilder().select('COUNT(*)', 'total').from('internships', 'i').where('i.status = :status', { status: InternshipStatus.APPROVED_PENDING_SGK }).andWhere("i.updated_at < NOW() - INTERVAL '3 days'")).getRawOne<{ total: string }>();
    if (Number(staleSgk?.total ?? 0) > 0) warnings.push(`SGK girişi için bekleyen ${staleSgk?.total} başvuru var. (3+ gündür işlem bekliyor)`);
    const staleCommission = await scoped(this.dataSource.createQueryBuilder().select('COUNT(*)', 'total').from('internships', 'i').where('i.status = :status', { status: InternshipStatus.PENDING_COMMISSION }).andWhere("i.updated_at < NOW() - INTERVAL '7 days'")).getRawOne<{ total: string }>();
    if (Number(staleCommission?.total ?? 0) > 0) warnings.push(`Komisyon onayı bekleyen ${staleCommission?.total} başvuru 7 günden eski.`);
    const deadline = await this.dataSource.createQueryBuilder().select('MIN(application_end)', 'deadline').from('academic_calendars', 'cal').where("application_end BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '5 days'").getRawOne<{ deadline: string | null }>();
    if (deadline?.deadline) warnings.push(`Akademik takvim başvuru son tarihi ${deadline.deadline} tarihine yaklaşıyor.`);
    const totalApplications = Number(totals?.total ?? 0);
    const activeCount = Number(active?.total ?? 0) + Number(completed?.total ?? 0);
    return { term: termName ? { id: term?.id ?? 'active-term', name: termName } : null, kpis: { totalApplications, pendingSgk: Number(pendingSgk?.total ?? 0), activeInternships: Number(active?.total ?? 0), completed: Number(completed?.total ?? 0), activeCompanies: Number(activeCompanies?.total ?? 0), pendingActions: Number(pendingActions?.total ?? 0), rejectedOrRevision: Number(rejected?.total ?? 0), activeUsers: Number(users?.total ?? 0), registeredCompanies: Number(registeredCompanies?.total ?? 0) }, statusDistribution, departmentDistribution, departmentDistributionTotals: { total: departmentDistribution.reduce((sum, item) => sum + item.total, 0), active: departmentDistribution.reduce((sum, item) => sum + item.active, 0), completed: departmentDistribution.reduce((sum, item) => sum + item.completed, 0) }, warnings, activePipelinePercentage: totalApplications ? Number(((activeCount / totalApplications) * 100).toFixed(1)) : 0, totalFiles: totalApplications, lastSyncAt: new Date().toISOString() };
  }

  async getHistoricalTerms(): Promise<HistoricalTerm[]> {
    const rows = await this.dataSource.createQueryBuilder().select('MIN(cal.id::text)', 'id').addSelect('cal.term_name', 'name').addSelect('COUNT(i.id)', 'totalApplications').addSelect('MAX(cal.application_end)', 'archivedAt').from('academic_calendars', 'cal').leftJoin('internships', 'i', 'i.start_date >= cal.internship_start AND i.start_date <= cal.internship_end').where('cal.application_end < CURRENT_DATE').groupBy('cal.term_name').orderBy('MAX(cal.application_end)', 'DESC').getRawMany<{ id: string; name: string; totalApplications: string; archivedAt: string }>();
    return rows.map((row) => ({ id: row.id, name: row.name, totalApplications: Number(row.totalApplications), archivedAt: new Date(row.archivedAt).toISOString() }));
  }

  async getAdminReportData(departmentId?: string, termId?: string): Promise<AdminReportData> {
    const internshipQuery = this.dataSource.createQueryBuilder().select('u.student_number', 'studentNumber').addSelect("concat(u.first_name, ' ', u.last_name)", 'studentName').addSelect('d.name', 'departmentName').addSelect('c.name', 'companyName').addSelect("to_char(i.start_date, 'YYYY-MM-DD')", 'startDate').addSelect("to_char(i.end_date, 'YYYY-MM-DD')", 'endDate').addSelect('i.status', 'status').addSelect("coalesce(i.grading_data->>'academicScore', 'N/A')", 'academicGrade').from('internships', 'i').innerJoin('users', 'u', 'u.id = i.student_id').innerJoin('departments', 'd', 'd.id = i.department_id').innerJoin('companies', 'c', 'c.id = i.company_id');
    if (departmentId) internshipQuery.andWhere('i.department_id = :reportDepartmentId', { reportDepartmentId: departmentId });
    if (termId) internshipQuery.innerJoin('academic_calendars', 'term', 'term.id = :termId AND i.start_date BETWEEN term.internship_start AND term.internship_end', { termId });
    const [internships, users, companies] = await Promise.all([internshipQuery.orderBy('i.created_at', 'DESC').getRawMany(), this.dataSource.createQueryBuilder().select("concat(u.first_name, ' ', u.last_name)", 'fullName').addSelect('u.email', 'email').addSelect('u.role', 'role').addSelect('coalesce(d.name, \'-\')', 'departmentName').addSelect('u.is_active', 'isActive').from('users', 'u').leftJoin('departments', 'd', 'd.id = u.department_id').orderBy('u.last_name', 'ASC').getRawMany(), this.dataSource.createQueryBuilder().select('name').addSelect('tax_number', 'taxNumber').addSelect('sgk_number', 'sgkNumber').addSelect('industry').addSelect('city').from('companies', 'c').orderBy('name', 'ASC').getRawMany()]);
    return { internships, users, companies };
  }

  async getAdminInternships(filters: { status?: string; departmentId?: string; termId?: string; term?: string; page?: number; pageSize?: number }): Promise<{ items: AdminInternshipRow[]; total: number; page: number; pageSize: number }> {
    const query = this.dataSource.createQueryBuilder().select('i.id', 'id').addSelect('i.department_id', 'departmentId').addSelect('i.student_id', 'studentId').addSelect('i.company_id', 'companyId').addSelect('u.student_number', 'studentNumber').addSelect("concat(u.first_name, ' ', u.last_name)", 'studentName').addSelect('d.name', 'departmentName').addSelect('c.name', 'companyName').addSelect("to_char(i.start_date, 'YYYY-MM-DD')", 'startDate').addSelect("to_char(i.end_date, 'YYYY-MM-DD')", 'endDate').addSelect('i.status', 'status').addSelect("coalesce(i.grading_data->>'academicScore', 'N/A')", 'employerGrade').from('internships', 'i').innerJoin('users', 'u', 'u.id = i.student_id').innerJoin('departments', 'd', 'd.id = i.department_id').innerJoin('companies', 'c', 'c.id = i.company_id');
    const statuses = parseAdminStatusFilter(filters.status);
    if (statuses.length > 0) query.andWhere('i.status IN (:...statuses)', { statuses });
    if (filters.departmentId) query.andWhere('i.department_id = :adminDepartmentId', { adminDepartmentId: filters.departmentId });
    if (filters.termId) query.innerJoin('academic_calendars', 'term', 'term.id = :adminTermId AND i.start_date BETWEEN term.internship_start AND term.internship_end', { adminTermId: filters.termId });
    if (filters.term === 'current') {
      const configRows = await this.dataSource.createQueryBuilder().select('key').addSelect('value').from('system_configs', 'c').where('key IN (:...keys)', { keys: ['ACADEMIC_YEAR', 'ACTIVE_SEMESTER'] }).getRawMany<{ key: string; value: string }>();
      const config = Object.fromEntries(configRows.map((row) => [row.key, row.value]));
      const range = deriveTermRange(config.ACADEMIC_YEAR, config.ACTIVE_SEMESTER);
      if (range) query.andWhere('i.start_date BETWEEN :adminTermStart AND :adminTermEnd', { adminTermStart: range.start, adminTermEnd: range.end });
    }
    const totalRow = await query.clone().select('COUNT(*)', 'total').getRawOne<{ total: string }>();
    const page = Math.max(1, filters.page ?? 1); const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
    const items = await query.orderBy('i.created_at', 'DESC').offset((page - 1) * pageSize).limit(pageSize).getRawMany<AdminInternshipRow>();
    return { items: items.map((item) => ({ ...item, readOnly: true })), total: Number(totalRow?.total ?? 0), page, pageSize };
  }

  async getAdminInternshipDetail(id: string): Promise<AdminInternshipRow | null> {
    const result = await this.getAdminInternships({ page: 1, pageSize: 1 });
    const item = result.items.find((row) => row.id === id);
    if (item) return item;
    const rows = await this.dataSource.createQueryBuilder().select('i.id', 'id').addSelect('i.department_id', 'departmentId').addSelect('i.student_id', 'studentId').addSelect('i.company_id', 'companyId').addSelect('u.student_number', 'studentNumber').addSelect("concat(u.first_name, ' ', u.last_name)", 'studentName').addSelect('d.name', 'departmentName').addSelect('c.name', 'companyName').addSelect("to_char(i.start_date, 'YYYY-MM-DD')", 'startDate').addSelect("to_char(i.end_date, 'YYYY-MM-DD')", 'endDate').addSelect('i.status', 'status').addSelect("coalesce(i.grading_data->>'academicScore', 'N/A')", 'employerGrade').from('internships', 'i').innerJoin('users', 'u', 'u.id = i.student_id').innerJoin('departments', 'd', 'd.id = i.department_id').innerJoin('companies', 'c', 'c.id = i.company_id').where('i.id = :id', { id }).getRawOne<AdminInternshipRow>();
    return rows ? { ...rows, readOnly: true } : null;
  }

  async getAdminCompanies(filters: AdminCompanyFilters): Promise<{ items: AdminCompanyRow[]; total: number; page: number; pageSize: number }> {
    const configRows = await this.dataSource.createQueryBuilder().select('key').addSelect('value').from('system_configs', 'c').where('key IN (:...keys)', { keys: ['ACADEMIC_YEAR', 'ACTIVE_SEMESTER'] }).getRawMany<{ key: string; value: string }>();
    const config = Object.fromEntries(configRows.map((row) => [row.key, row.value]));
    const termRange = deriveTermRange(config.ACADEMIC_YEAR, config.ACTIVE_SEMESTER);
    const activeFilter = termRange ? `i.status = 'ONGOING' AND i.start_date BETWEEN :companyTermStart AND :companyTermEnd` : `i.status = 'ONGOING'`;
    const activeCount = `(SELECT COUNT(*) FROM internships i WHERE i.company_id = c.id AND ${activeFilter})`;
    const query = this.dataSource.createQueryBuilder().select('c.id', 'id').addSelect('c.name', 'name').addSelect('c.tax_number', 'taxNumber').addSelect('c.sgk_number', 'sgkNumber').addSelect('c.iban', 'iban').addSelect('c.city', 'city').addSelect('c.industry', 'industry').addSelect('c.is_verified', 'isVerified').addSelect('c.is_active', 'isActive').addSelect(activeCount, 'activeInternships').from('companies', 'c');
    const params = termRange ? { companyTermStart: termRange.start, companyTermEnd: termRange.end } : {};
    if (filters.search) query.andWhere('(c.name ILIKE :companySearch OR c.tax_number ILIKE :companySearch)', { companySearch: `%${filters.search}%` });
    if (filters.city) query.andWhere('c.city ILIKE :companyCity', { companyCity: `%${filters.city}%` });
    if (filters.industry) query.andWhere('c.industry ILIKE :companyIndustry', { companyIndustry: `%${filters.industry}%` });
    if (filters.isVerified !== undefined) query.andWhere('c.is_verified = :companyVerified', { companyVerified: filters.isVerified });
    if (filters.isActive !== undefined) query.andWhere('c.is_active = :companyActive', { companyActive: filters.isActive });
    if (filters.termActive) query.andWhere(`EXISTS (SELECT 1 FROM internships i WHERE i.company_id = c.id AND ${activeFilter})`);
    query.setParameters(params);
    const totalRow = await query.clone().select('COUNT(*)', 'total').getRawOne<{ total: string }>();
    const page = Math.max(1, filters.page ?? 1); const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
    const items = await query.orderBy('c.name', 'ASC').offset((page - 1) * pageSize).limit(pageSize).getRawMany<AdminCompanyRow>();
    return { items: items.map((item) => ({ ...item, isVerified: item.isVerified === true || String(item.isVerified) === 'true', isActive: item.isActive === true || String(item.isActive) === 'true', activeInternships: Number(item.activeInternships ?? 0) })), total: Number(totalRow?.total ?? 0), page, pageSize };
  }
}

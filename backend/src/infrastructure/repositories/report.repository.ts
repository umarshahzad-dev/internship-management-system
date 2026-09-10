import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  IReportRepository,
  InternshipReportFilter,
  InternshipReportRow,
  InternshipSummary,
  AdminDashboardSummary,
} from '../../application/ports/report.repository.port';

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

  async getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
    const [statusRows, departmentRows, userCount, companyCount] = await Promise.all([
      this.dataSource.createQueryBuilder().select('i.status', 'status').addSelect('COUNT(*)', 'total').from('internships', 'i').groupBy('i.status').getRawMany<{ status: string; total: string }>(),
      this.dataSource.createQueryBuilder().select('d.id', 'departmentId').addSelect('d.name', 'departmentName').addSelect('COUNT(i.id)', 'total').from('departments', 'd').leftJoin('internships', 'i', 'i.department_id = d.id').groupBy('d.id').addGroupBy('d.name').orderBy('d.name', 'ASC').getRawMany<{ departmentId: string; departmentName: string; total: string }>(),
      this.dataSource.createQueryBuilder().select('COUNT(*)', 'total').from('users', 'u').getRawOne<{ total: string }>(),
      this.dataSource.createQueryBuilder().select('COUNT(*)', 'total').from('companies', 'c').getRawOne<{ total: string }>(),
    ]);
    return {
      totalInternships: statusRows.reduce((sum, row) => sum + Number(row.total), 0),
      byStatus: Object.fromEntries(statusRows.map((row) => [row.status, Number(row.total)])),
      byDepartment: departmentRows.map((row) => ({ departmentId: row.departmentId, departmentName: row.departmentName, total: Number(row.total) })),
      totalUsers: Number(userCount?.total ?? 0),
      totalCompanies: Number(companyCount?.total ?? 0),
    };
  }
}

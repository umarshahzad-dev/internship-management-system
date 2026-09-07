import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  IReportRepository,
  InternshipReportFilter,
  InternshipReportRow,
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

    return query.getRawMany<InternshipReportRow>();
  }
}

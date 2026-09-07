export interface InternshipReportFilter {
  status?: string;
  departmentId?: string;
}

export interface InternshipReportRow {
  studentNumber: string;
  studentName: string;
  departmentName: string;
  companyName: string;
  startDate: string;
  endDate: string;
  status: string;
  employerGrade: string;
}

export abstract class IReportRepository {
  abstract getInternshipData(
    filters: InternshipReportFilter,
  ): Promise<InternshipReportRow[]>;
}

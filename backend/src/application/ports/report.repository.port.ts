export interface InternshipReportFilter {
  status?: string;
  departmentId?: string;
  limit?: number;
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

export interface InternshipSummary {
  totalApplications: number;
  pendingApplications: number;
  completedApplications: number;
}

export interface AdminDashboardSummary {
  totalInternships: number;
  byStatus: Record<string, number>;
  byDepartment: Array<{ departmentId: string; departmentName: string; total: number }>;
  totalUsers: number;
  totalCompanies: number;
}

export abstract class IReportRepository {
  abstract getInternshipData(filters: InternshipReportFilter): Promise<InternshipReportRow[]>;
  abstract getInternshipSummary(): Promise<InternshipSummary>;
  abstract getAdminDashboardSummary(): Promise<AdminDashboardSummary>;
}

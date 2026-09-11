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
  term: { id: string; name: string } | null;
  kpis: {
    totalApplications: number;
    pendingSgk: number;
    activeInternships: number;
    completed: number;
    activeCompanies: number;
    pendingActions: number;
    rejectedOrRevision: number;
    activeUsers: number;
    registeredCompanies: number;
  };
  statusDistribution: Array<{ status: string; label: string; count: number }>;
  departmentDistribution: Array<{ departmentId: string; name: string; total: number; active: number; completed: number }>;
  departmentDistributionTotals: { total: number; active: number; completed: number };
  warnings: string[];
  activePipelinePercentage: number;
  totalFiles: number;
  lastSyncAt: string;
}

export interface HistoricalTerm {
  id: string;
  name: string;
  totalApplications: number;
  archivedAt: string;
}

export interface AdminInternshipRow extends InternshipReportRow {
  id: string;
  departmentId: string;
  studentId: string;
  companyId: string;
  readOnly: true;
}

export interface AdminReportData {
  internships: Array<InternshipReportRow & { academicGrade: string }>;
  users: Array<{ fullName: string; email: string; role: string; departmentName: string; isActive: boolean }>;
  companies: Array<{ name: string; taxNumber: string; sgkNumber: string; industry: string; city: string }>;
}

export interface AdminCompanyFilters {
  termActive?: boolean;
  search?: string;
  city?: string;
  industry?: string;
  isVerified?: boolean;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface AdminCompanyRow {
  id: string;
  name: string;
  taxNumber: string;
  sgkNumber: string | null;
  iban: string | null;
  city: string | null;
  industry: string | null;
  isVerified: boolean;
  isActive: boolean;
  activeInternships: number;
}

export abstract class IReportRepository {
  abstract getInternshipData(filters: InternshipReportFilter): Promise<InternshipReportRow[]>;
  abstract getInternshipSummary(): Promise<InternshipSummary>;
  abstract getAdminDashboardSummary(departmentId?: string): Promise<AdminDashboardSummary>;
  abstract getHistoricalTerms(): Promise<HistoricalTerm[]>;
  abstract getAdminReportData(departmentId?: string, termId?: string): Promise<AdminReportData>;
  abstract getAdminInternships(filters: { status?: string; departmentId?: string; termId?: string; term?: string; page?: number; pageSize?: number }): Promise<{ items: AdminInternshipRow[]; total: number; page: number; pageSize: number }>;
  abstract getAdminInternshipDetail(id: string): Promise<AdminInternshipRow | null>;
  abstract getAdminCompanies(filters: AdminCompanyFilters): Promise<{ items: AdminCompanyRow[]; total: number; page: number; pageSize: number }>;
}

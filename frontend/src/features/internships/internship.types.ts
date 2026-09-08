export type InternshipStatus = 'DRAFT' | 'SUBMITTED' | 'REVISION_REQUIRED' | 'APPROVED' | 'ONGOING' | 'EVALUATION' | 'GRADED' | 'COMPLETED' | string

export interface InternshipListItem {
  id: string
  departmentId?: string
  studentId?: string
  companyId?: string
  companyName?: string
  status: InternshipStatus
  startDate: string
  endDate: string
  locked?: boolean
  approvedAt?: string | null
}

export interface InternshipDetail extends InternshipListItem {
  studentName?: string
  company?: { name?: string; city?: string | null }
  description?: string | null
}

export interface DailyLog {
  id: string
  internshipId: string
  logDate: string
  content: string
}

export const internshipStatusLabels: Record<string, string> = {
  DRAFT: 'Taslak', SUBMITTED: 'Gönderildi', REVISION_REQUIRED: 'Revizyon gerekli', APPROVED: 'Onaylandı',
  ONGOING: 'Devam ediyor', EVALUATION: 'Değerlendirmede', GRADED: 'Notlandırıldı', COMPLETED: 'Tamamlandı',
}

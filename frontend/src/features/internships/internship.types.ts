export type InternshipStatus =
  | 'DRAFT'
  | 'APPLIED'
  | 'REVISION'
  | 'REVISION_REQUESTED'
  | 'PENDING_EMPLOYER'
  | 'PENDING_COMMISSION'
  | 'APPROVED'
  | 'APPROVED_PENDING_SGK'
  | 'REJECTED'
  | 'ONGOING'
  | 'EVALUATION'
  | 'GRADED'
  | 'COMPLETED'
  | 'WITHDRAWN'
  | string

export interface InternshipListItem {
  id: string
  departmentId?: string
  studentId?: string
  companyId?: string
  companyName?: string
  studentName?: string
  studentNumber?: string | null
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
  DRAFT: 'Taslak',
  APPLIED: 'Başvuruldu',
  REVISION: 'Revizyon gerekli',
  REVISION_REQUESTED: 'Revizyon istendi',
  PENDING_EMPLOYER: 'İşveren onayı bekleniyor',
  PENDING_COMMISSION: 'Komisyon onayı bekleniyor',
  APPROVED: 'Onaylandı',
  APPROVED_PENDING_SGK: 'SGK işlemi bekleniyor',
  REJECTED: 'Reddedildi',
  WITHDRAWN: 'Geri çekildi',
  // Kept for compatibility with older API payloads.
  SUBMITTED: 'Gönderildi',
  REVISION_REQUIRED: 'Revizyon gerekli',
  ONGOING: 'Devam ediyor',
  EVALUATION: 'Değerlendirmede',
  GRADED: 'Notlandırıldı',
  COMPLETED: 'Tamamlandı',
}

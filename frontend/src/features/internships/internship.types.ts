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
  DRAFT: 'Öğrenci Başvuru Taslağı',
  APPLIED: 'Başvuruldu',
  REVISION: 'Revizyon Bekleyen',
  REVISION_REQUESTED: 'Revizyon Bekleyen',
  PENDING_EMPLOYER: 'Firma Kabul Belgesi İncelemesi',
  PENDING_COMMISSION: 'Bölüm Ön Kontrol / Komisyon Onayı Bekleyen',
  APPROVED: 'Onaylandı',
  APPROVED_PENDING_SGK: 'SGK Giriş Onayı Bekleyen',
  REJECTED: 'Reddedildi',
  WITHDRAWN: 'İptal / İade Edilen',
  // Kept for compatibility with older API payloads.
  SUBMITTED: 'Gönderildi',
  REVISION_REQUIRED: 'Revizyon gerekli',
  ONGOING: 'Aktif Devam Eden Staj',
  ACTIVE: 'Aktif Devam Eden Staj',
  EVALUATION: 'Staj Defteri Değerlendirme',
  GRADED: 'Notlandırıldı',
  COMPLETED: 'Arşivlendi / Tamamlandı',
}

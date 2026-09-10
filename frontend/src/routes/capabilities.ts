import type { UserRole } from '../features/auth/auth.types'

export const canReviewDocuments = (role: UserRole, status?: string) => role === 'ACADEMIC' && status === 'PENDING'
export const canViewDailyLogs = (role: UserRole, status: string) => role === 'STUDENT' || (role === 'ACADEMIC' && ['EVALUATION', 'GRADED', 'COMPLETED'].includes(status))
export const canViewInternships = (role: UserRole) => role === 'STUDENT' || role === 'ACADEMIC'
export const canManageCompanies = (role: UserRole) => role === 'ADMIN'

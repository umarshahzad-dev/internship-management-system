import type { UserRole } from '../auth/auth.types'

const LOG_READ_STATUSES = new Set(['EVALUATION', 'GRADED', 'COMPLETED'])

export function canRoleViewDailyLogs(role: UserRole, status: string) {
  return role === 'STUDENT' || (role === 'ACADEMIC' && LOG_READ_STATUSES.has(status))
}

export function canManageEmployerEvaluation(role: UserRole, status: string) {
  return role === 'ACADEMIC' && status === 'EVALUATION'
}

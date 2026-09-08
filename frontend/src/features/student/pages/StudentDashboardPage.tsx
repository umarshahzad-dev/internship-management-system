import { DashboardPage } from '../../dashboard/DashboardPage'
import type { UserRole } from '../../auth/auth.types'
export function StudentDashboardPage() { return <DashboardPage role={'STUDENT' satisfies UserRole} /> }

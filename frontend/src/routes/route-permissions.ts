import type { UserRole } from '../features/auth/auth.types'

export const ROUTE_PERMISSIONS = {
  dashboard: ['STUDENT', 'ACADEMIC', 'ADMINISTRATIVE', 'ADMIN'],
  internships: ['STUDENT', 'ACADEMIC', 'ADMINISTRATIVE', 'ADMIN'],
  internshipDetail: ['STUDENT', 'ACADEMIC', 'ADMINISTRATIVE', 'ADMIN'],
  internshipDocuments: ['STUDENT', 'ACADEMIC', 'ADMIN'],
  stajDefteri: ['STUDENT', 'ACADEMIC', 'ADMIN'],
  mandatoryLetter: ['STUDENT'],
  profile: ['STUDENT'],
  companies: ['ACADEMIC', 'ADMIN'],
  documentTypes: ['ACADEMIC', 'ADMIN'],
  calendars: ['STUDENT', 'ACADEMIC', 'ADMINISTRATIVE', 'ADMIN'],
  holidays: ['STUDENT', 'ACADEMIC', 'ADMINISTRATIVE', 'ADMIN'],
  sgk: ['ACADEMIC', 'ADMINISTRATIVE'],
  internshipSgk: ['ACADEMIC', 'ADMINISTRATIVE'],
  sgkUpload: ['ACADEMIC', 'ADMINISTRATIVE'],
  sgkStatus: ['ACADEMIC', 'ADMINISTRATIVE'],
  approve: ['ACADEMIC'],
  reject: ['ACADEMIC'],
  requestRevision: ['ACADEMIC'],
  sicilFisi: ['ACADEMIC', 'ADMINISTRATIVE'],
  transitionToOngoing: ['ACADEMIC', 'ADMINISTRATIVE'],
  finalize: ['ACADEMIC', 'ADMINISTRATIVE'],
  scoring: ['ACADEMIC'],
  users: ['ADMIN'],
  departments: ['ADMIN'],
  reports: ['ADMIN'],
  systemConfigs: ['STUDENT', 'ACADEMIC', 'ADMINISTRATIVE', 'ADMIN'],
} as const satisfies Record<string, readonly UserRole[]>

export type RoutePermissionKey = keyof typeof ROUTE_PERMISSIONS

export function canAccessRoute(permission: RoutePermissionKey, role: UserRole) {
  return (ROUTE_PERMISSIONS[permission] as readonly UserRole[]).includes(role)
}

export type NavigationIcon = 'dashboard' | 'internships' | 'calendar' | 'users' | 'departments' | 'companies' | 'documents' | 'shield' | 'settings'

export interface NavigationDefinition {
  href: string
  permission: RoutePermissionKey
  label: string
  studentLabel?: string
  icon: NavigationIcon
}

export const NAVIGATION_ITEMS: NavigationDefinition[] = [
  { href: '/dashboard', permission: 'dashboard', label: 'Çalışma alanı', icon: 'dashboard' },
  { href: '/internships', permission: 'internships', label: 'Stajlar', studentLabel: 'Stajlarım', icon: 'internships' },
  { href: '/calendars', permission: 'calendars', label: 'Akademik takvim', icon: 'calendar' },
  { href: '/holidays', permission: 'holidays', label: 'Tatiller', icon: 'calendar' },
  { href: '/profile', permission: 'profile', label: 'Profilim', icon: 'users' },
  { href: '/companies', permission: 'companies', label: 'Firmalar', icon: 'companies' },
  { href: '/document-types', permission: 'documentTypes', label: 'Belge türleri', icon: 'documents' },
  { href: '/sgk', permission: 'sgk', label: 'SGK işlemleri', icon: 'shield' },
  { href: '/users', permission: 'users', label: 'Kullanıcılar', icon: 'users' },
  { href: '/departments', permission: 'departments', label: 'Bölümler', icon: 'departments' },
  { href: '/system-configs', permission: 'systemConfigs', label: 'Sistem ayarları', icon: 'settings' },
]

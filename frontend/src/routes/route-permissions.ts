import type { UserRole } from '../features/auth/auth.types'

export const ROUTE_PERMISSIONS = {
  dashboard: ['STUDENT', 'ACADEMIC', 'ADMINISTRATIVE', 'ADMIN'],
  adminDashboard: ['ADMIN'],
  internships: ['STUDENT', 'ACADEMIC'],
  internshipDetail: ['STUDENT', 'ACADEMIC'],
  internshipDocuments: ['STUDENT', 'ACADEMIC'],
  stajDefteri: ['STUDENT'],
  mandatoryLetter: ['STUDENT', 'ACADEMIC', 'ADMIN'],
  applicationForm: ['STUDENT', 'ACADEMIC', 'ADMINISTRATIVE'],
  profile: ['STUDENT', 'ACADEMIC', 'ADMINISTRATIVE', 'ADMIN'],
  studentOperations: ['STUDENT'],
  companies: ['STUDENT', 'ACADEMIC', 'ADMIN'],
  documentTypes: ['STUDENT', 'ACADEMIC', 'ADMIN'],
  studentDocumentTypes: ['STUDENT'],
  academicDocumentTypes: ['ACADEMIC'],
  calendars: ['STUDENT', 'ACADEMIC', 'ADMIN'],
  sgk: ['ADMINISTRATIVE'],
  internshipSgk: ['ADMINISTRATIVE'],
  sgkUpload: ['ADMINISTRATIVE'],
  sgkStatus: ['ADMINISTRATIVE'],
  approve: ['ACADEMIC'],
  reject: ['ACADEMIC'],
  requestRevision: ['ACADEMIC'],
  sicilFisi: ['ACADEMIC'],
  transitionToOngoing: ['ADMINISTRATIVE'],
  finalize: ['ACADEMIC'],
  scoring: ['ACADEMIC'],
  users: ['ADMIN'],
  departments: ['ADMIN'],
  adminInternships: ['ADMIN'],
  systemConfigs: ['ADMIN'],
  announcements: ['ADMIN', 'ACADEMIC'],
} as const satisfies Record<string, readonly UserRole[]>

export type RoutePermissionKey = keyof typeof ROUTE_PERMISSIONS

export function canAccessRoute(permission: RoutePermissionKey, role: UserRole) {
  return (ROUTE_PERMISSIONS[permission] as readonly UserRole[]).includes(role)
}

export type NavigationIcon = 'dashboard' | 'internships' | 'calendar' | 'users' | 'departments' | 'companies' | 'documents' | 'shield' | 'settings' | 'announcement'

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
  { href: '/calendar', permission: 'calendars', label: 'Akademik takvim ve tatiller', icon: 'calendar' },
  { href: '/profile', permission: 'profile', label: 'Profilim', icon: 'users' },
  { href: '/staj-islemleri', permission: 'studentOperations', label: 'Staj işlemleri', icon: 'documents' },
  { href: '/companies', permission: 'companies', label: 'Firmalar', icon: 'companies' },
  { href: '/document-types', permission: 'studentDocumentTypes', label: 'Belge türleri', icon: 'documents' },
  { href: '/academic/document-types', permission: 'academicDocumentTypes', label: 'Belge türleri', icon: 'documents' },
  { href: '/sgk', permission: 'sgk', label: 'SGK işlemleri', icon: 'shield' },
  { href: '/users', permission: 'users', label: 'Kullanıcılar', icon: 'users' },
  { href: '/departments', permission: 'departments', label: 'Bölümler', icon: 'departments' },
  { href: '/system-configs', permission: 'systemConfigs', label: 'Sistem ayarları', icon: 'settings' },
  { href: '/announcements', permission: 'announcements', label: 'Duyurular', icon: 'announcement' },
]

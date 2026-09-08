import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { PublicLayout } from '../layout/PublicLayout'
import { LoginPage } from '../features/auth/LoginPage'
import type { UserRole } from '../features/auth/auth.types'
import { AuthGuard, RoleGuard } from './guards'
import { DocumentTitle, NotFoundPage, PublicRoutePage } from './pages'
import { RouteErrorBoundary } from './RouteErrorBoundary'
import { canAccessRoute, type RoutePermissionKey } from './route-permissions'
import { useAuth } from '../features/auth/auth-context'
import { InternshipListPage } from '../features/internships/InternshipListPage'
import { InternshipDetailPage } from '../features/internships/InternshipDetailPage'
import { DomainListPage } from '../features/domain/DomainListPage'
import { InternshipDocumentsPage } from '../features/domain/InternshipDocumentsPage'
import { SgkPage } from '../features/domain/SgkPage'
import { InternshipActionPage } from '../features/domain/InternshipActionPage'
import { ReportsPage } from '../features/domain/ReportsPage'
import { PdfDownloadPage } from '../features/domain/PdfDownloadPage'
import { ScoringPage } from '../features/domain/ScoringPage'
import { ProfilePage } from '../features/domain/ProfilePage'
import { StudentDashboardPage } from '../features/student/pages/StudentDashboardPage'
import { AcademicDashboardPage } from '../features/academic/pages/AcademicDashboardPage'
import { AdministrativeDashboardPage } from '../features/administrative/pages/AdministrativeDashboardPage'
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage'
import { AdminOperationsPage } from '../features/admin/pages/AdminOperationsPage'

export interface AppRoutesProps { isAuthenticated?: boolean; role?: UserRole }
function permitted(role: UserRole, permission: RoutePermissionKey, page: ReactNode) { return <RoleGuard role={role} allowedRoles={permissionRoles(permission)}>{page}</RoleGuard> }
function permissionRoles(permission: RoutePermissionKey) {
  const roles: UserRole[] = ['STUDENT', 'ACADEMIC', 'ADMINISTRATIVE', 'ADMIN']
  return roles.filter((role) => canAccessRoute(permission, role))
}
function dashboardForRole(role: UserRole) {
  if (role === 'ADMIN') return <AdminDashboardPage />
  if (role === 'ACADEMIC') return <AcademicDashboardPage />
  if (role === 'ADMINISTRATIVE') return <AdministrativeDashboardPage />
  return <StudentDashboardPage />
}
export function AppRoutes({ isAuthenticated, role }: AppRoutesProps) {
  const auth = useAuth()
  const effectiveIsAuthenticated = isAuthenticated ?? auth.isAuthenticated
  const effectiveRole = role ?? auth.user?.role ?? 'STUDENT'
  const effectiveLoading = isAuthenticated === undefined ? auth.isLoading : false
  return <RouteErrorBoundary><Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<PublicLayout><DocumentTitle title="Oturum aç" /><LoginPage onAuthenticated={auth.setSessionUser} /></PublicLayout>} />
    <Route path="/forgot-password" element={<PublicRoutePage title="Şifre yenileme" description="Kurumsal hesabınız için yenileme bağlantısı isteyin." />} />
    <Route path="/reset-password" element={<PublicRoutePage title="Şifreyi yenile" description="Yeni şifrenizi belirlemek için bağlantıdaki adımları tamamlayın." />} />
    <Route path="/employer/approve/:token" element={<PublicRoutePage title="İşveren onayı" description="Staj başvurusunu işveren tokenı ile onaylayın." />} />
    <Route path="/employer/evaluate/:token" element={<PublicRoutePage title="İşveren değerlendirmesi" description="Stajı değerlendirmek ve günlük kayıtları imzalamak için formu tamamlayın." />} />
    <Route path="/verify/:internshipId" element={<PublicRoutePage title="Staj doğrulama" description="Staj kaydının doğrulama sonucunu görüntüleyin." />} />
    <Route element={<AuthGuard isAuthenticated={effectiveIsAuthenticated} isLoading={effectiveLoading} />}><Route element={<AuthenticatedLayout role={effectiveRole} />}>
      <Route path="/dashboard" element={permitted(effectiveRole, 'dashboard', dashboardForRole(effectiveRole))} />
      <Route path="/internships" element={permitted(effectiveRole, 'internships', <InternshipListPage role={effectiveRole} />)} />
      <Route path="/internships/documents/zorunlu-staj-belgesi" element={permitted(effectiveRole, 'mandatoryLetter', <PdfDownloadPage title="Zorunlu staj belgesi" endpoint="/internships/documents/zorunlu-staj-belgesi" filename="zorunlu-staj-belgesi.pdf" />)} />
      <Route path="/internships/:id" element={permitted(effectiveRole, 'internshipDetail', <InternshipDetailPage role={effectiveRole} />)} />
      <Route path="/internships/:id/documents" element={permitted(effectiveRole, 'internshipDocuments', <InternshipDocumentsPage role={effectiveRole} />)} />
      <Route path="/internships/:id/staj-defteri" element={permitted(effectiveRole, 'stajDefteri', <PdfDownloadPage title="Staj defteri" endpoint="/internships/:id/staj-defteri" filename="staj-defteri.pdf" />)} />
      <Route path="/profile" element={permitted(effectiveRole, 'profile', <ProfilePage />)} />
      <Route path="/companies" element={permitted(effectiveRole, 'companies', <DomainListPage title="Firmalar" description="Staj kurumlarını ve doğrulama durumlarını yönetin." endpoint="/companies" queryKey={['companies']} columns={[{ key: 'name', header: 'Firma' }, { key: 'city', header: 'Şehir' }, { key: 'isVerified', header: 'Doğrulama' }]} />)} />
      <Route path="/document-types" element={permitted(effectiveRole, 'documentTypes', <DomainListPage title="Belge türleri" description="Staj başvurularında kullanılan belge türlerini yönetin." endpoint="/document-types" queryKey={['document-types']} columns={[{ key: 'name', header: 'Belge' }, { key: 'isRequired', header: 'Zorunlu' }, { key: 'source', header: 'Kaynak' }]} />)} />
      <Route path="/calendars" element={permitted(effectiveRole, 'calendars', <DomainListPage title="Akademik takvimler" description="Başvuru ve staj tarihlerini takip edin." endpoint="/calendars" queryKey={['calendars']} columns={[{ key: 'termName', header: 'Dönem' }, { key: 'applicationStart', header: 'Başlangıç' }, { key: 'applicationEnd', header: 'Bitiş' }]} />)} />
      <Route path="/holidays" element={permitted(effectiveRole, 'holidays', <DomainListPage title="Tatiller" description="Çalışma günü hesaplamalarında kullanılan tatilleri görüntüleyin." endpoint="/holidays" queryKey={['holidays']} columns={[{ key: 'holidayDate', header: 'Tarih' }, { key: 'name', header: 'Açıklama' }]} />)} />
      <Route path="/sgk" element={permitted(effectiveRole, 'sgk', <SgkPage />)} />
      <Route path="/internships/:id/sgk" element={permitted(effectiveRole, 'internshipSgk', <SgkPage />)} />
      <Route path="/sgk/:id/upload" element={permitted(effectiveRole, 'sgkUpload', <SgkPage />)} />
      <Route path="/sgk/:id/status" element={permitted(effectiveRole, 'sgkStatus', <SgkPage />)} />
      <Route path="/internships/:id/approve" element={permitted(effectiveRole, 'approve', <InternshipActionPage action="approve" title="Stajı onayla" />)} />
      <Route path="/internships/:id/reject" element={permitted(effectiveRole, 'reject', <InternshipActionPage action="reject" title="Stajı reddet" />)} />
      <Route path="/internships/:id/request-revision" element={permitted(effectiveRole, 'requestRevision', <InternshipActionPage action="request-revision" title="Revizyon iste" />)} />
      <Route path="/internships/:id/sicil-fisi" element={permitted(effectiveRole, 'sicilFisi', <PdfDownloadPage title="Sicil fişi" endpoint="/internships/:id/sicil-fisi" filename="sicil-fisi.pdf" />)} />
      <Route path="/internships/:id/transition-to-ongoing" element={permitted(effectiveRole, 'transitionToOngoing', <InternshipActionPage action="transition-to-ongoing" title="Stajı başlat" />)} />
      <Route path="/internships/:id/finalize" element={permitted(effectiveRole, 'finalize', <InternshipActionPage action="finalize" title="Stajı kesinleştir" />)} />
      <Route path="/scoring/:internshipId" element={permitted(effectiveRole, 'scoring', <ScoringPage />)} />
      <Route path="/users" element={permitted(effectiveRole, 'users', <AdminOperationsPage mode="users" />)} />
      <Route path="/departments" element={permitted(effectiveRole, 'departments', <AdminOperationsPage mode="departments" />)} />
      <Route path="/reports" element={permitted(effectiveRole, 'reports', <ReportsPage />)} />
      <Route path="/system-configs" element={permitted(effectiveRole, 'systemConfigs', <DomainListPage title="Sistem ayarları" description="Kurum genelindeki sistem yapılandırmalarını görüntüleyin." endpoint={effectiveRole === 'ADMIN' ? '/system-configs/admin' : '/system-configs/public'} queryKey={['system-configs', effectiveRole === 'ADMIN' ? 'admin' : 'public']} columns={[{ key: 'key', header: 'Anahtar' }, { key: 'value', header: 'Değer' }]} />)} />
      <Route path="*" element={<NotFoundPage />} />
    </Route></Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes></RouteErrorBoundary>
}

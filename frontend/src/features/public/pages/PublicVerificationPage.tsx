import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Badge, ErrorState, LoadingState, PageHeader, Panel } from '../../../components/ui'
import { normalizeApiError, publicApi } from '../../../lib/api'
import { DocumentTitle } from '../../../routes/pages'

interface VerificationResult { internshipId: string; studentName: string; studentNumber: string | null; companyName: string; status: string; startDate: string; endDate: string; employerApprovalTimestamp: string | null; commissionApprovalTimestamp: string | null; employerLogsApprovedAt: string | null; isValid: boolean }

export function PublicVerificationPage() {
  const { internshipId = '' } = useParams<{ internshipId: string }>()
  const query = useQuery({ queryKey: ['public-verification', internshipId], queryFn: async () => (await publicApi.get<VerificationResult>(`/public/internship/${internshipId}/verify`)).data, enabled: Boolean(internshipId) })
  if (query.isLoading) return <main className="mx-auto max-w-2xl p-6"><DocumentTitle title="Staj doğrulama" /><LoadingState label="Doğrulama kaydı yükleniyor" /></main>
  if (query.isError || !query.data) return <main className="mx-auto max-w-2xl p-6"><DocumentTitle title="Staj doğrulama" /><ErrorState title="Kayıt doğrulanamadı" message={normalizeApiError(query.error).message} onRetry={() => void query.refetch()} /></main>
  const item = query.data
  return <main className="mx-auto max-w-2xl p-6"><DocumentTitle title="Staj doğrulama" /><PageHeader title="Staj doğrulama" description="Konya Teknik Üniversitesi staj kaydı doğrulama sonucu." /><Panel title={item.isValid ? 'Geçerli staj kaydı' : 'Geçersiz veya tamamlanmamış kayıt'}><div className="flex items-center gap-3"><Badge variant={item.isValid ? 'success' : 'danger'}>{item.isValid ? 'DOĞRULANDI' : 'DOĞRULANAMADI'}</Badge><span className="text-sm text-gray-500">{item.status}</span></div><dl className="mt-5 grid gap-3 text-sm"><div><dt className="text-xs uppercase text-gray-500">Öğrenci</dt><dd className="font-semibold text-navy">{item.studentName}{item.studentNumber ? ` · ${item.studentNumber}` : ''}</dd></div><div><dt className="text-xs uppercase text-gray-500">Kurum</dt><dd>{item.companyName}</dd></div><div><dt className="text-xs uppercase text-gray-500">Tarih aralığı</dt><dd>{item.startDate} — {item.endDate}</dd></div>{item.employerApprovalTimestamp ? <div><dt className="text-xs uppercase text-gray-500">İşveren onayı</dt><dd>{new Date(item.employerApprovalTimestamp).toLocaleString('tr-TR')}</dd></div> : null}{item.commissionApprovalTimestamp ? <div><dt className="text-xs uppercase text-gray-500">Komisyon onayı</dt><dd>{new Date(item.commissionApprovalTimestamp).toLocaleString('tr-TR')}</dd></div> : null}{item.employerLogsApprovedAt ? <div><dt className="text-xs uppercase text-gray-500">Günlük kayıt dijital imzası</dt><dd className="font-semibold text-navy">İşveren tarafından dijital olarak imzalandı · {new Date(item.employerLogsApprovedAt).toLocaleString('tr-TR')}</dd></div> : null}</dl></Panel></main>
}

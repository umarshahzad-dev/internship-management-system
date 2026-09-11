import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Archive, BriefcaseBusiness, Building2, CalendarDays, CheckCircle2, Clock3, Download, FolderOpen, ShieldAlert, Users, XCircle } from 'lucide-react'
import { Badge, Button, ErrorState, LoadingState, PageHeader, Panel } from '../../../components/ui'
import { api, unwrapPaginated } from '../../../lib/api'
import { downloadBlob } from '../../../lib/download-blob'
import { useAdminDepartment } from '../../departments/department-context'
import { DocumentTitle } from '../../../routes/pages'

type Summary = {
  term: { id: string; name: string } | null
  kpis: Record<'totalApplications' | 'pendingSgk' | 'activeInternships' | 'completed' | 'activeCompanies' | 'pendingActions' | 'rejectedOrRevision' | 'activeUsers', number>
  statusDistribution: Array<{ status: string; label: string; count: number }>
  departmentDistribution: Array<{ departmentId: string; name: string; total: number; active: number; completed: number }>
  departmentDistributionTotals: { total: number; active: number; completed: number }
  warnings: string[]
  activePipelinePercentage: number
  totalFiles: number
  lastSyncAt: string
}
type LegacySummary = {
  totalInternships?: number
  pendingInternships?: number
  completedInternships?: number
  activeInternships?: number
  byStatus?: Record<string, number>
  byDepartment?: Array<{ departmentId: string; departmentName: string; count: number }>
}
type HistoricalTerm = { id: string; name: string; totalApplications: number; archivedAt: string }

// Remove the term=current query to intentionally audit historical records.
const cards = [
  ['totalApplications', 'TOPLAM BAŞVURU', 'Kapsamdaki toplam staj başvurusu', FolderOpen, '/admin/internships?term=current'],
  ['pendingSgk', 'SGK BEKLEYEN', 'SGK işlemi bekleyen başvurular', ShieldAlert, '/admin/internships?term=current&status=APPROVED_PENDING_SGK'],
  ['activeInternships', 'AKTİF STAJLAR', 'Devam eden staj kayıtları', BriefcaseBusiness, '/admin/internships?term=current&status=ONGOING,ACTIVE'],
  ['completed', 'TAMAMLANAN', 'Notlandırılmış stajlar', CheckCircle2, '/admin/internships?term=current&status=GRADED'],
  ['activeCompanies', 'AKTİF FİRMA SAYISI', 'Bu dönemde staj yürütülen firmalar', Building2, '/admin/companies?termActive=true'],
  ['pendingActions', 'İŞLEM BEKLEYEN', 'Komisyon veya firma adımı bekleyen', Clock3, '/admin/internships?term=current&status=PENDING_EMPLOYER,PENDING_COMMISSION'],
  ['rejectedOrRevision', 'REDDEDİLEN BAŞVURU', 'Reddedilen veya revizyon bekleyen', XCircle, '/admin/internships?term=current&status=REJECTED,REVISION'],
  ['activeUsers', 'SİSTEM KULLANICI SAYISI', 'Aktif sistem kullanıcısı', Users, '/admin/users'],
] as const

const statusTone = (status: string) => ['GRADED', 'COMPLETED'].includes(status) ? 'success' : status === 'APPROVED_PENDING_SGK' || status === 'REJECTED' ? 'danger' : ['PENDING_EMPLOYER', 'PENDING_COMMISSION', 'REVISION'].includes(status) ? 'warning' : 'info'

export function AdminDashboardPage() {
  const [params, setParams] = useSearchParams()
  const { departmentId, setDepartmentId } = useAdminDepartment()
  const selectedDepartment = params.get('departmentId') ?? departmentId ?? ''
  const departments = useQuery({ queryKey: ['admin', 'departments'], queryFn: async () => unwrapPaginated((await api.get('/departments')).data) as Array<{ id: string; name: string }> })
  const summary = useQuery({ queryKey: ['admin', 'dashboard', 'summary', { departmentId: selectedDepartment || undefined }], queryFn: async () => (await api.get<Summary>('/admin/dashboard-summary', { params: selectedDepartment ? { departmentId: selectedDepartment } : undefined })).data })
  const history = useQuery({ queryKey: ['admin', 'historical-terms'], queryFn: async () => (await api.get<HistoricalTerm[]>('/admin/historical-terms')).data })
  const termName = summary.data?.term?.name ?? 'Aktif dönem'
  const legacy = summary.data as (Summary & LegacySummary) | undefined
  const kpis = summary.data?.kpis ?? {
    totalApplications: legacy?.totalInternships ?? 0,
    pendingSgk: legacy?.pendingInternships ?? 0,
    activeInternships: legacy?.activeInternships ?? 0,
    completed: legacy?.completedInternships ?? 0,
    activeCompanies: 0,
    pendingActions: 0,
    rejectedOrRevision: 0,
    activeUsers: 0,
  }
  const statusDistribution = summary.data?.statusDistribution ?? Object.entries(legacy?.byStatus ?? {}).map(([status, count]) => ({ status, label: status, count }))
  const departmentDistribution = summary.data?.departmentDistribution ?? (legacy?.byDepartment ?? []).map((item) => ({ departmentId: item.departmentId, name: item.departmentName, total: item.count, active: 0, completed: 0 }))
  const maxStatus = Math.max(1, ...statusDistribution.map((item) => item.count))
  const totalRows = summary.data?.departmentDistributionTotals
  const warnings = summary.data?.warnings ?? []

  const setScope = (value: string) => {
    setDepartmentId(value || null)
    if (value) params.set('departmentId', value); else params.delete('departmentId')
    setParams(params)
  }
  async function downloadCurrent() {
    const response = await api.get<Blob>('/admin/reports/current-term', { params: selectedDepartment ? { departmentId: selectedDepartment } : undefined, responseType: 'blob' })
    downloadBlob(response.data, `KTUN_IMAS_Rapor_${termName.replaceAll(' ', '-')}.xlsx`)
  }
  async function downloadHistorical(id: string, name: string) {
    const response = await api.get<Blob>(`/admin/reports/historical/${id}`, { responseType: 'blob' })
    downloadBlob(response.data, `KTUN_IMAS_Rapor_${name.replaceAll(' ', '-')}.xlsx`)
  }

  return <>
    <DocumentTitle title="Merkezi yönetim paneli" />
    <h2 className="sr-only">Yönetim çalışma alanı</h2>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
      <div className="flex items-center gap-2 text-sm text-gray-600"><CalendarDays className="h-4 w-4 text-navy" aria-hidden="true" /><span>Dönem:</span><Badge variant="info">{termName}</Badge></div>
      <div className="flex flex-wrap items-center gap-3"><label className="text-xs font-semibold uppercase tracking-wide text-gray-500" htmlFor="dashboard-department">Bölüm kapsamı:</label><select id="dashboard-department" value={selectedDepartment} onChange={(event) => setScope(event.target.value)} className="min-h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"><option value="">Tüm Üniversite</option>{(departments.data ?? []).map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select><Button variant="danger" onClick={() => void downloadCurrent()}><Download className="h-4 w-4" aria-hidden="true" />Excel Raporu İndir</Button></div>
    </div>
    <PageHeader title="Merkezi Staj & İşyeri Eğitimi Yönetim Paneli" description={`${termName} Yarıyılı Anlık İdari Takip Konsolu (Bölüm ve kurum süreçlerinin canlı görünümü).`} actions={<div className="flex items-center gap-2"><Badge variant="success">● Canlı Veri Akışı</Badge><Badge variant="danger">Protokol: KTUN-STJ-v4.2</Badge></div>} />
    {summary.isLoading ? <LoadingState label="Yönetim özeti yükleniyor" /> : summary.isError ? <ErrorState title="Yönetim özeti alınamadı" message="Konsol verileri geçici olarak kullanılamıyor." onRetry={() => void summary.refetch()} /> : <>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([key, title, subtitle, Icon, href]) => <Link key={key} to={href} className={`group relative rounded-md border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-navy ${key === 'pendingSgk' && kpis[key] > 0 ? 'border-red border-l-4' : 'border-gray-200'}`}><Icon className="absolute right-4 top-4 h-5 w-5 text-navy/50 group-hover:text-red" aria-hidden="true" /><p className="text-[11px] font-bold tracking-[0.14em] text-gray-500">{title}</p><p className="mt-3 text-3xl font-bold tabular-nums text-navy">{kpis[key]}</p><p className="mt-1 text-xs text-gray-500">{key === 'pendingSgk' && kpis[key] > 0 ? <Badge variant="danger">ACİL</Badge> : subtitle}</p></Link>)}</div>
      {warnings.length > 0 ? <div className="mt-4 flex flex-wrap items-center gap-3 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-950"><AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" /><strong>{warnings[0]}</strong><Badge variant="warning">YÜKSEK ÖNCELİK</Badge><Badge variant="warning">Son İşlem: {summary.data?.lastSyncAt ? new Date(summary.data.lastSyncAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '—'}</Badge></div> : null}
      <div className="mt-4 grid gap-4 xl:grid-cols-2"><Panel title="Durum Dağılımı" description="Sistemdeki tüm süreçlerin anlık aşamaları." actions={<Badge variant="info">10 AŞAMA</Badge>}><div className="space-y-3">{statusDistribution.map((item, index) => <div key={item.status} className={`rounded px-2 py-1.5 ${item.status === 'APPROVED_PENDING_SGK' ? 'bg-red/5' : ['GRADED', 'COMPLETED'].includes(item.status) ? 'bg-emerald-50' : ''}`}><div className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2"><span className="w-5 text-xs font-bold text-gray-400">{String(index + 1).padStart(2, '0')}</span><span className="truncate font-medium text-gray-700">{item.label}</span></span><strong className="tabular-nums text-navy">{item.count}</strong></div><div className="mt-1 h-1 rounded bg-gray-100"><div className={`h-1 rounded ${statusTone(item.status) === 'danger' ? 'bg-red' : statusTone(item.status) === 'success' ? 'bg-emerald-500' : statusTone(item.status) === 'warning' ? 'bg-gold' : 'bg-navy'}`} style={{ width: `${Math.round((item.count / maxStatus) * 100)}%` }} /></div></div>)}</div><div className="mt-4 flex flex-wrap justify-between border-t border-gray-200 pt-3 text-xs text-gray-500"><span>Aktif Pipeline Yükü: <strong className="text-navy">%{summary.data?.activePipelinePercentage ?? 0}</strong></span><span>Net Dosya: <strong className="text-navy">{(summary.data?.totalFiles ?? 0).toLocaleString('tr-TR')} Adet</strong></span></div></Panel>
        {!selectedDepartment ? <Panel title="Bölüm Dağılımı" description="Bölümlere göre staj süreçlerinin görünümü." actions={<Badge variant="info">Fakülte</Badge>}><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-gray-200 text-[11px] uppercase tracking-wide text-gray-500"><tr><th className="py-2">BÖLÜM</th><th className="py-2 text-right">TOPLAM</th><th className="py-2 text-right">AKTİF</th><th className="py-2 text-right">TAMAMLANAN</th></tr></thead><tbody>{departmentDistribution.map((item) => <tr key={item.departmentId} className="border-b border-gray-100"><td className="py-2 font-medium text-gray-700">{item.name}</td><td className="py-2 text-right tabular-nums">{item.total}</td><td className="py-2 text-right tabular-nums">{item.active}</td><td className="py-2 text-right tabular-nums">{item.completed}</td></tr>)}</tbody><tfoot className="font-bold text-navy"><tr><td className="py-3">Fakülte Toplamı</td><td className="py-3 text-right">{totalRows?.total ?? 0}</td><td className="py-3 text-right">{totalRows?.active ?? 0}</td><td className="py-3 text-right">{totalRows?.completed ?? 0}</td></tr></tfoot></table></div><p className="mt-3 text-xs text-gray-500">Fakülte Kapsamı: {departmentDistribution.length} Bölüm Aktif <span className="mx-1">·</span><Link to="/departments" className="font-semibold text-navy underline">Bölüm Detay Raporunu Görüntüle →</Link></p></Panel> : null}
      </div>
    </>}
    <Panel className="mt-4" title="Geçmiş Dönem Raporları" description="Önceki akademik dönemlere ait konsolide staj ve başvuru kayıtları." actions={<Badge variant="neutral">Arşiv Doğrulama Anahtarı: SHA-256</Badge>}>
      {history.isLoading ? <LoadingState label="Arşiv yükleniyor" /> : history.isError ? <ErrorState title="Arşiv alınamadı" message="Geçmiş dönem kayıtları kullanılamıyor." onRetry={() => void history.refetch()} /> : <><div className="max-h-72 overflow-y-auto"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-white text-[11px] uppercase tracking-wide text-gray-500"><tr><th className="py-2">DÖNEM ADI</th><th className="py-2 text-right">TOPLAM BAŞVURU</th><th className="py-2 text-right">İŞLEM</th></tr></thead><tbody>{(history.data ?? []).slice(0, 5).map((term) => <tr key={term.id} className="border-t border-gray-100"><td className="py-3"><span className="inline-flex items-center gap-2 font-medium text-gray-700"><Archive className="h-4 w-4 text-gray-400" aria-hidden="true" />{term.name}</span><Badge className="ml-2" variant="neutral">Arşivlendi</Badge></td><td className="py-3 text-right font-bold tabular-nums text-navy">{term.totalApplications.toLocaleString('tr-TR')}</td><td className="py-3 text-right"><Button variant="outline" className="px-3" onClick={() => void downloadHistorical(term.id, term.name)}><Download className="h-4 w-4" aria-hidden="true" />İndir</Button></td></tr>)}</tbody></table></div><div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-gray-200 pt-3 text-xs text-gray-500"><span>Tüm arşiv verileri KTÜN Bilgi İşlem Daire Başkanlığı sunucularında mühürlü saklanmaktadır.</span><span>Toplam Kayıt: {(history.data ?? []).length} Akademik Yarıyıl</span></div></>}
    </Panel>
  </>
}

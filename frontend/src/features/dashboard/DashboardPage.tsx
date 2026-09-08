import { Activity, BriefcaseBusiness, CheckCircle2, Clock3, FileCheck2, ShieldCheck } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader, Panel } from '../../components/ui'
import { DocumentTitle } from '../../routes/pages'
import { useInternships } from '../internships/internship.queries'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { InternshipListItem } from '../internships/internship.types'
import { internshipStatusLabels } from '../internships/internship.types'
import type { UserRole } from '../auth/auth.types'

const roleCopy: Record<UserRole, { title: string; description: string; accent: string }> = {
  STUDENT: { title: 'Öğrenci çalışma alanı', description: 'Başvurularınızı, günlük kayıtlarınızı ve staj belgelerinizi tek ekrandan takip edin.', accent: 'Staj süreciniz' },
  ACADEMIC: { title: 'Akademik çalışma alanı', description: 'Bölümünüzdeki staj başvurularını ve değerlendirme adımlarını yönetin.', accent: 'Bölüm görünümü' },
  ADMINISTRATIVE: { title: 'İdari çalışma alanı', description: 'SGK, belge ve staj operasyonlarını bölüm kapsamınızda koordine edin.', accent: 'Operasyon merkezi' },
  ADMIN: { title: 'Yönetim çalışma alanı', description: 'Kurum genelindeki kullanıcı, bölüm ve staj süreçlerini yönetin.', accent: 'Kurum görünümü' },
}

function countByStatus(items: InternshipListItem[], statuses: string[]) { return items.filter((item) => statuses.includes(item.status)).length }

export function DashboardPage({ role }: { role: UserRole }) {
  const copy = roleCopy[role]
  const internships = useInternships()
  const operations = useQuery({ queryKey: ['dashboard', 'operations', role], queryFn: async () => (await api.get<Array<Record<string, unknown>>>(role === 'ADMIN' ? '/departments' : '/holidays')).data })
  const rows = internships.data ?? []
  const cards = role === 'STUDENT'
    ? [{ label: 'Toplam staj', value: rows.length, icon: BriefcaseBusiness }, { label: 'Aktif süreç', value: countByStatus(rows, ['ONGOING', 'EVALUATION']), icon: Activity }, { label: 'Tamamlanan', value: countByStatus(rows, ['COMPLETED', 'GRADED']), icon: CheckCircle2 }]
    : role === 'ADMIN'
      ? [{ label: 'Toplam başvuru', value: rows.length, icon: BriefcaseBusiness }, { label: 'Onay bekleyen', value: countByStatus(rows, ['SUBMITTED']), icon: Clock3 }, { label: 'Tamamlanan', value: countByStatus(rows, ['COMPLETED']), icon: CheckCircle2 }]
      : [{ label: 'Bölüm başvuruları', value: rows.length, icon: BriefcaseBusiness }, { label: 'İşlem bekleyen', value: countByStatus(rows, ['SUBMITTED', 'EVALUATION']), icon: Clock3 }, { label: 'Belge kontrolü', value: countByStatus(rows, ['APPROVED', 'ONGOING']), icon: FileCheck2 }]

  return <>
    <DocumentTitle title={copy.title} />
    <PageHeader title={copy.title} description={copy.description} actions={<NavLink to="/internships" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-red px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red/90 focus:outline-none focus:ring-2 focus:ring-navy">Stajlara git</NavLink>} />
    <div className="grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon }) => <Panel key={label} className="p-4"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-2 text-3xl font-bold text-navy">{internships.isLoading ? '—' : value}</p></div><Icon aria-hidden="true" className="h-5 w-5 text-red" /></div></Panel>)}</div>
    <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Panel title="Son staj kayıtları" description={`${copy.accent} · güncel durum özeti`}>
        {internships.isLoading ? <LoadingState label="Stajlar yükleniyor" /> : internships.isError ? <ErrorState title="Stajlar alınamadı" message="Kayıtlar yüklenirken bir sorun oluştu." onRetry={() => void internships.refetch()} /> : rows.length === 0 ? <EmptyState title="Henüz staj kaydı yok" message="Yeni bir staj başlattığınızda güncel durum burada görünür." action={<NavLink to="/internships" className="text-sm font-semibold text-navy underline">Stajlarım</NavLink>} /> : <div className="space-y-2">{rows.slice(0, 4).map((item) => <NavLink key={item.id} to={`/internships/${item.id}`} className="flex items-center justify-between border-b border-gray-100 px-1 py-3 last:border-0 hover:bg-gray-50"><span className="text-sm font-semibold text-navy">{item.companyName ?? `Staj #${item.id.slice(0, 6)}`}</span><Badge variant={item.status === 'COMPLETED' ? 'success' : item.status === 'SUBMITTED' ? 'warning' : 'info'}>{internshipStatusLabels[item.status] ?? item.status}</Badge></NavLink>)}</div>}
      </Panel>
      <Panel title="Hızlı işlemler"><div className="grid gap-2">{(role === 'STUDENT' ? [['/internships', 'Stajlarımı görüntüle'], ['/profile', 'Profilimi güncelle']] : role === 'ADMIN' ? [['/users', 'Kullanıcıları yönet'], ['/reports', 'Rapor indir']] : [['/internships', 'Başvuruları incele'], ['/sgk', 'SGK işlemleri']]).map(([href, label]) => <NavLink key={href} to={href} className="flex items-center gap-3 border border-gray-200 px-3 py-3 text-sm font-semibold text-navy hover:border-red hover:bg-red/5"><ShieldCheck aria-hidden="true" className="h-4 w-4 text-red" />{label}</NavLink>)}</div></Panel>
      <Panel title={role === 'ADMIN' ? 'Bölüm özeti' : 'Takvim özeti'}>{operations.isLoading ? <LoadingState label="Özet yükleniyor" /> : operations.isError ? <ErrorState title="Özet alınamadı" message="Bu panel geçici olarak kullanılamıyor." onRetry={() => void operations.refetch()} /> : <p className="text-sm text-gray-600">{operations.data?.length ?? 0} kayıt güncel kapsamda.</p>}</Panel>
    </div>
  </>
}

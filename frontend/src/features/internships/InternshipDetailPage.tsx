import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Badge, Button, ErrorState, Input, LoadingState, PageHeader, Panel, Table, Textarea } from '../../components/ui'
import { DocumentTitle } from '../../routes/pages'
import { api } from '../../lib/api'
import { useCompanies, useCreateDailyLog, useDailyLogs, useInternship, useUpdateDailyLog } from './internship.queries'
import { internshipStatusLabels } from './internship.types'
import type { UserRole } from '../auth/auth.types'
import { EmployerEvaluationPanel } from '../academic/components/EmployerEvaluationPanel'

export function InternshipDetailPage({ role }: { role: UserRole }) {
  const { id } = useParams<{ id: string }>()
  const detail = useInternship(id)
  const companies = useCompanies(role !== 'ADMINISTRATIVE')
  const logs = useDailyLogs(id)
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [logDate, setLogDate] = useState('')
  const [content, setContent] = useState('')
  const [workingDays, setWorkingDays] = useState<number | null>(null)
  const [range, setRange] = useState({ startDate: '', endDate: '' })
  const createLog = useCreateDailyLog(id ?? '')
  const updateLog = useUpdateDailyLog(id ?? '')
  if (detail.isLoading) return <><DocumentTitle title="Staj detayı" /><LoadingState label="Staj detayı yükleniyor" /></>
  if (detail.isError || !detail.data) return <><DocumentTitle title="Staj detayı" /><ErrorState title="Staj bulunamadı" message="Staj bilgileri yüklenirken bir sorun oluştu." onRetry={() => void detail.refetch()} /></>
  const item = detail.data
  const companyName = item.companyName ?? item.company?.name ?? companies.data?.find((company) => company.id === item.companyId)?.name
  const canEditLogs = role === 'STUDENT' && !['EVALUATION', 'GRADED', 'COMPLETED'].includes(item.status)
  const logsDescription = canEditLogs
    ? 'Staj günlerinizi düzenli olarak kaydedin.'
    : ['EVALUATION', 'GRADED', 'COMPLETED'].includes(item.status)
      ? 'Staj tamamlandığı için günlük kayıtlar salt okunurdur.'
      : 'Bu rolde günlük kayıtlar salt okunurdur.'
  return <>
    <DocumentTitle title="Staj detayı" />
    <PageHeader title={companyName ?? 'Staj detayı'} description="Staj başvurusu, belgeler ve günlük kayıtlar." actions={<div className="flex gap-2"><Link className="rounded-md border border-navy px-3 py-2 text-sm font-semibold text-navy hover:bg-gray-50" to={`/internships/${id}/documents`}>Belgeler</Link>{role === 'STUDENT' ? <Link className="rounded-md bg-red px-3 py-2 text-sm font-semibold text-white hover:bg-red/90" to={`/internships/${id}/staj-defteri`}>Staj defteri</Link> : null}</div>} />
    <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
      <Panel title="Başvuru özeti"><dl className="grid gap-3 text-sm"><div><dt className="text-xs uppercase tracking-wide text-gray-500">Durum</dt><dd className="mt-1"><Badge variant="info">{internshipStatusLabels[item.status] ?? item.status}</Badge></dd></div><div><dt className="text-xs uppercase tracking-wide text-gray-500">Tarih aralığı</dt><dd className="mt-1 font-semibold text-navy">{item.startDate} — {item.endDate}</dd></div><div><dt className="text-xs uppercase tracking-wide text-gray-500">Kurum</dt><dd className="mt-1">{companyName ?? '—'}</dd></div></dl></Panel>
      <Panel title="Günlük kayıtlar" description={logsDescription}>{logs.isLoading ? <LoadingState label="Günlük kayıtlar yükleniyor" /> : logs.isError ? <ErrorState title="Günlük kayıtlar alınamadı" message="Kayıtlar yüklenirken bir sorun oluştu." onRetry={() => void logs.refetch()} /> : <><Table caption="Günlük kayıtlar" columns={[{ key: 'logDate', header: 'Tarih' }, { key: 'content', header: 'Açıklama', className: 'whitespace-normal' }, ...(canEditLogs ? [{ key: 'edit', header: 'İşlem', render: (row: NonNullable<typeof logs.data>[number]) => <button type="button" className="font-semibold text-navy underline hover:text-red" onClick={() => { setEditingLogId(row.id); setLogDate(row.logDate); setContent(row.content) }}>Düzenle</button> }] : [])]} data={logs.data ?? []} rowKey={(row) => row.id} emptyMessage="Henüz günlük kayıt eklenmedi." />{canEditLogs ? <div className="mt-5 border-t border-gray-200 pt-5"><p className="text-sm font-bold text-navy">{editingLogId ? 'Günlük kaydı düzenle' : 'Yeni günlük kayıt'}</p><div className="mt-3 grid gap-3 sm:grid-cols-[12rem_1fr]"><Input label="Tarih" type="date" value={logDate} onChange={(event) => setLogDate(event.target.value)} /><Textarea label="Gün içeriği" value={content} onChange={(event) => setContent(event.target.value)} /></div><div className="mt-3 flex gap-2"><Button loading={createLog.isPending || updateLog.isPending} onClick={() => { if (editingLogId) void updateLog.mutateAsync({ id: editingLogId, logDate, content }).then(() => { setEditingLogId(null); setLogDate(''); setContent('') }); else void createLog.mutateAsync({ logDate, content }).then(() => { setLogDate(''); setContent('') }) }}>{editingLogId ? 'Kaydı güncelle' : 'Kayıt ekle'}</Button>{editingLogId ? <Button variant="outline" onClick={() => { setEditingLogId(null); setLogDate(''); setContent('') }}>Vazgeç</Button> : null}</div></div> : null}</>}</Panel>
    </div>
    {role === 'STUDENT' ? <Panel className="mt-4" title="Çalışma günü hesapla" description="Staj tarih aralığınız için resmi tatilleri dikkate alarak çalışma gününü hesaplayın."><div className="grid gap-3 sm:grid-cols-[12rem_12rem_auto] sm:items-end"><Input label="Başlangıç" type="date" value={range.startDate} onChange={(event) => setRange({ ...range, startDate: event.target.value })} /><Input label="Bitiş" type="date" value={range.endDate} onChange={(event) => setRange({ ...range, endDate: event.target.value })} /><Button onClick={() => void api.post<{ totalDays: number }>('/holidays/calculate-working-days', { ...range, includeSaturdays: false }).then((response) => setWorkingDays(response.data.totalDays))}>Hesapla</Button></div>{workingDays !== null ? <p className="mt-3 text-sm font-semibold text-navy" role="status">Toplam çalışma günü: {workingDays}</p> : null}</Panel> : null}
    {role === 'ACADEMIC' ? <EmployerEvaluationPanel internshipId={id ?? ''} /> : null}
  </>
}

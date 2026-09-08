import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, ConfirmDialog, DataToolbar, EmptyState, ErrorState, Input, LoadingState, PageHeader, Panel, Pagination, Select, Table } from '../../components/ui'
import { DocumentTitle } from '../../routes/pages'
import { useInternships } from './internship.queries'
import { internshipStatusLabels, type InternshipListItem } from './internship.types'
import type { UserRole } from '../auth/auth.types'
import { useTableUrlState } from '../shared/hooks/useTableUrlState'
import { api } from '../../lib/api'
import { invalidateDomainQueries } from '../../lib/mutation-invalidation'
import { queryKeys } from '../../lib/query-keys'

function statusVariant(status: string) { return status === 'COMPLETED' || status === 'GRADED' ? 'success' : status === 'SUBMITTED' || status === 'REVISION_REQUIRED' ? 'warning' : 'info' as const }

function InternshipRowActions({ row }: { row: InternshipListItem }) {
  const client = useQueryClient()
  const [confirm, setConfirm] = useState<'submit' | 'withdraw' | 'complete' | null>(null)
  const action = useMutation({ mutationFn: (name: string) => api.post(`/internships/${row.id}/${name}`), onSuccess: () => invalidateDomainQueries(client, [queryKeys.internships.all, queryKeys.internships.detail(row.id)]) })
  const label = confirm === 'submit' ? 'Gönder' : confirm === 'withdraw' ? 'Geri çek' : 'Tamamla'
  return <><div className="flex items-center gap-2"><Link className="font-semibold text-navy underline-offset-4 hover:text-red hover:underline" to={`/internships/${row.id}`}>Detayı aç</Link>{row.status === 'DRAFT' ? <button type="button" className="font-semibold text-navy underline hover:text-red" onClick={() => setConfirm('submit')}>Gönder</button> : null}{row.status === 'SUBMITTED' ? <button type="button" className="font-semibold text-red underline" onClick={() => setConfirm('withdraw')}>Geri çek</button> : null}{row.status === 'ONGOING' ? <button type="button" className="font-semibold text-red underline" onClick={() => setConfirm('complete')}>Tamamla</button> : null}</div><ConfirmDialog open={Boolean(confirm)} title={`${label} işlemini onayla`} description="Bu durum değişikliği staj akışını etkiler." confirmLabel={label} onCancel={() => setConfirm(null)} onConfirm={() => { if (confirm) void action.mutateAsync(confirm).finally(() => setConfirm(null)) }} /></>
}

export function InternshipListPage({ role }: { role: UserRole }) {
  const query = useInternships()
  const client = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [draft, setDraft] = useState({ companyId: '', startDate: '', endDate: '' })
  const createDraft = useMutation({ mutationFn: () => api.post('/internships', draft), onSuccess: () => { setCreateOpen(false); void invalidateDomainQueries(client, [queryKeys.internships.all]) } })
  const table = useTableUrlState()
  const isStudent = role === 'STUDENT'
  const rows = (query.data ?? []).filter((row) => `${row.companyName ?? ''} ${row.status}`.toLowerCase().includes(table.search.toLowerCase())).sort((a, b) => table.sort === 'date' ? a.startDate.localeCompare(b.startDate) : table.sort === 'status' ? a.status.localeCompare(b.status) : 0)
  const totalPages = Math.max(1, Math.ceil(rows.length / table.pageSize))
  const pageRows = rows.slice((table.page - 1) * table.pageSize, table.page * table.pageSize)
  const columns = [
    { key: 'company', header: 'Kurum', render: (row: InternshipListItem) => row.companyName ?? 'Kurum bilgisi bekleniyor' },
    { key: 'period', header: 'Tarih aralığı', render: (row: InternshipListItem) => `${row.startDate} — ${row.endDate}` },
    { key: 'status', header: 'Durum', render: (row: InternshipListItem) => <Badge variant={statusVariant(row.status)}>{internshipStatusLabels[row.status] ?? row.status}</Badge> },
    { key: 'actions', header: 'İşlem', render: (row: InternshipListItem) => <InternshipRowActions row={row} /> },
  ]
  return <>
    <DocumentTitle title={isStudent ? 'Stajlarım' : 'Staj başvuruları'} />
    <PageHeader title={isStudent ? 'Stajlarım' : 'Staj başvuruları'} description={isStudent ? 'Başvurularınızı ve devam eden stajlarınızı takip edin.' : 'Bölüm kapsamındaki staj süreçlerini durumlarına göre inceleyin.'} actions={isStudent ? <Button onClick={() => setCreateOpen(true)}>Yeni staj başvurusu</Button> : undefined} />
    {isStudent && createOpen ? <Panel className="mb-4" title="Taslak staj başvurusu"><div className="grid gap-3 sm:grid-cols-3"><Input label="Kurum ID" value={draft.companyId} onChange={(event) => setDraft({ ...draft, companyId: event.target.value })} /><Input label="Başlangıç" type="date" value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} /><Input label="Bitiş" type="date" value={draft.endDate} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} /></div><div className="mt-4 flex gap-2"><Button loading={createDraft.isPending} onClick={() => void createDraft.mutateAsync()}>Taslağı oluştur</Button><Button variant="outline" onClick={() => setCreateOpen(false)}>Vazgeç</Button></div></Panel> : null}
    <Panel><DataToolbar search={{ value: table.search, onChange: (value) => table.update({ search: value }), placeholder: 'Kurum adı veya durum ara' }} filters={<Select label="Sırala" value={table.sort} onChange={(event) => table.update({ sort: event.target.value })} options={[{ value: 'date', label: 'Başlangıç tarihi' }, { value: 'status', label: 'Durum' }]} placeholder="Sıralama" />} />{query.isFetching && !query.isLoading ? <p className="mb-2 text-xs text-gray-500" role="status">Liste güncelleniyor…</p> : null}{query.isRefetchError && rows.length > 0 ? <p className="mb-2 text-sm text-red" role="alert">Son güncelleme alınamadı; gösterilen veriler korunuyor.</p> : null}<div className="mt-4">{query.isLoading ? <LoadingState label="Stajlar yükleniyor" /> : query.isError ? <ErrorState title="Stajlar alınamadı" message="Liste yüklenirken bir sorun oluştu." onRetry={() => void query.refetch()} /> : rows.length === 0 ? <EmptyState title={table.search ? 'Sonuç bulunamadı' : 'Kayıt bulunamadı'} message={table.search ? 'Arama ölçütünü değiştirip tekrar deneyin.' : 'Bu kapsamda görüntülenecek staj kaydı bulunmuyor.'} /> : <><Table columns={columns} data={pageRows} rowKey={(row) => row.id} caption="Staj kayıtları" /><Pagination className="mt-4 justify-end" page={Math.min(table.page, totalPages)} totalPages={totalPages} onPageChange={(page) => table.update({ page })} /></>}</div></Panel>
  </>
}

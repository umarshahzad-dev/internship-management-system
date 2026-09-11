import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, ConfirmDialog, DataToolbar, EmptyState, ErrorState, Input, LoadingState, PageHeader, Panel, Pagination, Select, Table } from '../../components/ui'
import { DocumentTitle } from '../../routes/pages'
import { useCompanies, useInternships } from './internship.queries'
import { internshipStatusLabels, type InternshipListItem } from './internship.types'
import type { UserRole } from '../auth/auth.types'
import { useTableUrlState } from '../shared/hooks/useTableUrlState'
import { api } from '../../lib/api'
import { invalidateDomainQueries } from '../../lib/mutation-invalidation'
import { queryKeys } from '../../lib/query-keys'
import { useAdminDepartment } from '../departments/department-context'

function statusVariant(status: string) {
  if (status === 'COMPLETED' || status === 'GRADED') return 'success' as const
  if (['PENDING_EMPLOYER', 'PENDING_COMMISSION', 'APPROVED_PENDING_SGK', 'SUBMITTED', 'REVISION', 'REVISION_REQUESTED', 'REVISION_REQUIRED'].includes(status)) return 'warning' as const
  if (status === 'REJECTED' || status === 'WITHDRAWN') return 'danger' as const
  return 'info' as const
}

export function DraftEditForm({ initial, onSubmit, onCancel, loading = false }: { initial: { companyId?: string; startDate: string; endDate: string }; onSubmit: (value: { companyId: string; startDate: string; endDate: string }) => void; onCancel?: () => void; loading?: boolean }) {
  const [value, setValue] = useState({ companyId: initial.companyId ?? '', startDate: initial.startDate, endDate: initial.endDate })
  return <div className="grid gap-3 sm:grid-cols-3"><Input label="Kurum ID" value={value.companyId} onChange={(event) => setValue({ ...value, companyId: event.target.value })} /><Input label="Başlangıç" type="date" value={value.startDate} onChange={(event) => setValue({ ...value, startDate: event.target.value })} /><Input label="Bitiş" type="date" value={value.endDate} onChange={(event) => setValue({ ...value, endDate: event.target.value })} /><div className="sm:col-span-3 flex gap-2"><Button loading={loading} onClick={() => onSubmit(value)}>Taslağı kaydet</Button>{onCancel ? <Button variant="outline" onClick={onCancel}>Vazgeç</Button> : null}</div></div>
}

function InternshipRowActions({ row, role }: { row: InternshipListItem; role: UserRole }) {
  const client = useQueryClient()
  const [confirm, setConfirm] = useState<'submit' | 'withdraw' | 'complete' | null>(null)
  const [editing, setEditing] = useState(false)
  const action = useMutation({ mutationFn: (name: string) => api.post(`/internships/${row.id}/${name}`), onSuccess: () => invalidateDomainQueries(client, [queryKeys.internships.all, queryKeys.internships.detail(row.id)]) })
  const edit = useMutation({ mutationFn: (value: { companyId: string; startDate: string; endDate: string }) => api.patch(`/internships/${row.id}`, value), onSuccess: () => { setEditing(false); void invalidateDomainQueries(client, [queryKeys.internships.all, queryKeys.internships.detail(row.id)]) } })
  const checklistApplies = role === 'STUDENT' && row.status === 'DRAFT'
  const required = useQuery({ queryKey: ['internships', row.id, 'required-documents'], queryFn: async () => { const [docs, types] = await Promise.all([api.get<Array<{ documentTypeId?: string; status?: string }>>(`/internships/${row.id}/documents`), api.get<Array<{ id: string; isRequired?: boolean; source?: string }>>('/document-types')]); const requiredTypes = types.data.filter((type) => type.isRequired && (type.source ?? 'EXTERNAL_UPLOAD') === 'EXTERNAL_UPLOAD'); return requiredTypes.every((type) => docs.data.some((doc) => doc.documentTypeId === type.id && doc.status === 'ACCEPTED')) }, enabled: checklistApplies })
  const label = confirm === 'submit' ? 'Gönder' : confirm === 'withdraw' ? 'Geri çek' : 'Tamamla'
  const canSubmit = role !== 'STUDENT' || !checklistApplies || required.data === true
  return <><div className="flex flex-wrap items-center gap-2"><Link className="font-semibold text-navy underline-offset-4 hover:text-red hover:underline" to={`/internships/${row.id}`}>Detayı aç</Link>{role === 'STUDENT' && (row.status === 'DRAFT' || row.status === 'REVISION' || row.status === 'REVISION_REQUESTED' || row.status === 'REVISION_REQUIRED') ? <button type="button" className="font-semibold text-navy underline hover:text-red" onClick={() => setEditing((open) => !open)}>Düzenle</button> : null}{role === 'STUDENT' && row.status === 'DRAFT' ? <button type="button" disabled={!canSubmit} title={!canSubmit ? 'Gönderim için zorunlu belgeleri kabul ettirin.' : undefined} className="font-semibold text-navy underline hover:text-red disabled:cursor-not-allowed disabled:opacity-50" onClick={() => setConfirm('submit')}>Gönder</button> : null}{role === 'STUDENT' && ['PENDING_EMPLOYER', 'PENDING_COMMISSION', 'SUBMITTED'].includes(row.status) ? <button type="button" className="font-semibold text-red underline" onClick={() => setConfirm('withdraw')}>Geri çek</button> : null}{role === 'STUDENT' && row.status === 'ONGOING' ? <button type="button" className="font-semibold text-red underline" onClick={() => setConfirm('complete')}>Tamamla</button> : null}</div>{checklistApplies && !canSubmit ? <p className="text-xs text-red">Zorunlu belgeler kabul edilmeden gönderim yapılamaz.</p> : null}{editing ? <div className="mt-3 min-w-[32rem] rounded border border-gray-200 bg-gray-50 p-3"><DraftEditForm initial={row} loading={edit.isPending} onCancel={() => setEditing(false)} onSubmit={(value) => void edit.mutateAsync(value)} /></div> : null}<ConfirmDialog open={Boolean(confirm)} title={`${label} işlemini onayla`} description="Bu durum değişikliği staj akışını etkiler." confirmLabel={label} onCancel={() => setConfirm(null)} onConfirm={() => { if (confirm) void action.mutateAsync(confirm).finally(() => setConfirm(null)) }} /></>
}

export function InternshipListPage({ role }: { role: UserRole }) {
  const { departmentId } = useAdminDepartment()
  const query = useInternships(role === 'ADMIN' ? departmentId : undefined)
  const companies = useCompanies(role !== 'ADMINISTRATIVE')
  const client = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [draft, setDraft] = useState({ companyId: '', startDate: '', endDate: '' })
  const createDraft = useMutation({ mutationFn: () => api.post('/internships', draft), onSuccess: () => { setCreateOpen(false); void invalidateDomainQueries(client, [queryKeys.internships.all]) } })
  const table = useTableUrlState()
  const isStudent = role === 'STUDENT'
  const rows = (query.data ?? []).map((row) => ({ ...row, companyName: row.companyName ?? companies.data?.find((company) => company.id === row.companyId)?.name })).filter((row) => `${row.companyName ?? ''} ${row.studentName ?? ''} ${row.studentNumber ?? ''} ${row.status}`.toLowerCase().includes(table.search.toLowerCase())).sort((a, b) => table.sort === 'date' ? a.startDate.localeCompare(b.startDate) : table.sort === 'status' ? a.status.localeCompare(b.status) : 0)
  const totalPages = Math.max(1, Math.ceil(rows.length / table.pageSize))
  const pageRows = rows.slice((table.page - 1) * table.pageSize, table.page * table.pageSize)
  const columns = [
    ...(role === 'ACADEMIC' ? [{ key: 'student', header: 'Öğrenci', render: (row: InternshipListItem) => row.studentName ? `${row.studentName}${row.studentNumber ? ` · ${row.studentNumber}` : ''}` : row.studentId ?? '—' }] : []),
    { key: 'company', header: 'Kurum', render: (row: InternshipListItem) => row.companyName ?? 'Kurum bilgisi bekleniyor' },
    { key: 'period', header: 'Tarih aralığı', render: (row: InternshipListItem) => `${row.startDate} — ${row.endDate}` },
    { key: 'status', header: 'Durum', render: (row: InternshipListItem) => <Badge variant={statusVariant(row.status)}>{internshipStatusLabels[row.status] ?? row.status}{row.status === 'ONGOING' ? <span className="sr-only">Devam ediyor</span> : null}</Badge> },
    { key: 'actions', header: 'İşlem', render: (row: InternshipListItem) => <InternshipRowActions row={row} role={role} /> },
  ]
  return <>
    <DocumentTitle title={isStudent ? 'Stajlarım' : 'Staj başvuruları'} />
    <PageHeader title={isStudent ? 'Stajlarım' : 'Staj başvuruları'} description={isStudent ? 'Başvurularınızı ve devam eden stajlarınızı takip edin.' : 'Bölüm kapsamındaki staj süreçlerini durumlarına göre inceleyin.'} actions={isStudent ? <Button onClick={() => setCreateOpen(true)}>Yeni staj başvurusu</Button> : undefined} />
    {isStudent && createOpen ? <Panel className="mb-4" title="Taslak staj başvurusu"><div className="grid gap-3 sm:grid-cols-3"><Input label="Kurum ID" value={draft.companyId} onChange={(event) => setDraft({ ...draft, companyId: event.target.value })} /><Input label="Başlangıç" type="date" value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} /><Input label="Bitiş" type="date" value={draft.endDate} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} /></div><div className="mt-4 flex gap-2"><Button loading={createDraft.isPending} onClick={() => void createDraft.mutateAsync()}>Taslağı oluştur</Button><Button variant="outline" onClick={() => setCreateOpen(false)}>Vazgeç</Button></div></Panel> : null}
    <Panel><DataToolbar search={{ value: table.search, onChange: (value) => table.update({ search: value }), placeholder: 'Kurum adı veya durum ara' }} filters={<Select label="Sırala" value={table.sort} onChange={(event) => table.update({ sort: event.target.value })} options={[{ value: 'date', label: 'Başlangıç tarihi' }, { value: 'status', label: 'Durum' }]} placeholder="Sıralama" />} />{query.isFetching && !query.isLoading ? <p className="mb-2 text-xs text-gray-500" role="status">Liste güncelleniyor…</p> : null}{query.isRefetchError && rows.length > 0 ? <p className="mb-2 text-sm text-red" role="alert">Son güncelleme alınamadı; gösterilen veriler korunuyor.</p> : null}<div className="mt-4">{query.isLoading ? <LoadingState label="Stajlar yükleniyor" /> : query.isError ? <ErrorState title="Stajlar alınamadı" message="Liste yüklenirken bir sorun oluştu." onRetry={() => void query.refetch()} /> : rows.length === 0 ? <EmptyState title={table.search ? 'Sonuç bulunamadı' : 'Kayıt bulunamadı'} message={table.search ? 'Arama ölçütünü değiştirip tekrar deneyin.' : 'Bu kapsamda görüntülenecek staj kaydı bulunmuyor.'} /> : <><Table columns={columns} data={pageRows} rowKey={(row) => row.id} caption="Staj kayıtları" /><Pagination className="mt-4 justify-end" page={Math.min(table.page, totalPages)} totalPages={totalPages} onPageChange={(page) => table.update({ page })} /></>}</div></Panel>
  </>
}

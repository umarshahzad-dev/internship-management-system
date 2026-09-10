/* oxlint-disable react(only-export-components) */
import { useQuery } from '@tanstack/react-query'
import { DocumentTitle } from '../../routes/pages'
import { Badge, DataToolbar, EmptyState, ErrorState, FileUpload, LoadingState, PageHeader, Panel, Pagination, Select, Table } from '../../components/ui'
import { useState } from 'react'
import { api, unwrapPaginated } from '../../lib/api'
import { queryKeys } from '../../lib/query-keys'
import { useTableUrlState } from '../shared/hooks/useTableUrlState'

// oxlint-disable-next-line react(only-export-components)
export function getSgkStatusOptions(currentStatus?: string) {
  const all = [
    { value: 'PENDING', label: 'Bekliyor' },
    { value: 'SUBMITTED', label: 'Gönderildi' },
    { value: 'ACTIVE', label: 'Aktif' },
  ]
  if (currentStatus === 'PENDING') return all.slice(0, 2)
  if (currentStatus === 'SUBMITTED') return all.slice(1)
  if (currentStatus === 'ACTIVE') return [all[2]]
  return all
}

// oxlint-disable-next-line react(only-export-components)
export function resolveSgkRowStatus(row: Record<string, unknown>, overrides: Record<string, string>) {
  return overrides[String(row.id)] ?? String(row.status ?? 'PENDING')
}

export function SgkPage() {
  const query = useQuery({ queryKey: queryKeys.sgk.all, queryFn: async () => unwrapPaginated((await api.get<Array<Record<string, unknown>> | { items: Array<Record<string, unknown>> }>('/sgk')).data) })
  const [rowStatuses, setRowStatuses] = useState<Record<string, string>>({}); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  async function updateStatus(id: string, nextStatus: string) { try { await api.patch(`/sgk/${id}/status`, { status: nextStatus }); setRowStatuses((current) => ({ ...current, [id]: nextStatus })); setMessage('SGK durumu güncellendi.'); setError(''); await query.refetch() } catch (cause) { setError((cause as { message?: string }).message ?? 'SGK durumu güncellenemedi.') } }
  async function uploadDocument(id: string, file: File) { try { const data = new FormData(); data.append('file', file); await api.post(`/sgk/${id}/upload`, data); setMessage('SGK belgesi yüklendi.'); setError(''); await query.refetch() } catch (cause) { setError((cause as { message?: string }).message ?? 'SGK belgesi yüklenemedi.') } }
  async function downloadDocument(id: string) { try { const response = await api.get(`/sgk/${id}/document`, { responseType: 'blob' }); const url = URL.createObjectURL(response.data); const link = document.createElement('a'); link.href = url; link.download = 'sgk-ise-giris-bildirgesi.pdf'; link.click(); URL.revokeObjectURL(url) } catch (cause) { setError((cause as { message?: string }).message ?? 'SGK belgesi indirilemedi.') } }
  const table = useTableUrlState(); const rows = (query.data ?? []).filter((row) => Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(table.search.toLowerCase()))); const totalPages = Math.max(1, Math.ceil(rows.length / table.pageSize)); const pageRows = rows.slice((table.page - 1) * table.pageSize, table.page * table.pageSize)
  return <><DocumentTitle title="SGK işlemleri" /><PageHeader title="SGK işlemleri" description="Staj sigorta kayıtlarını ve belge durumlarını bölüm kapsamınızda yönetin." backHref="/dashboard" backLabel="Panele dön" /><Panel><DataToolbar search={{ value: table.search, onChange: (value) => table.update({ search: value }), placeholder: 'Öğrenci, firma veya durum ara' }} /><div className="mt-4">{query.isLoading ? <LoadingState label="SGK kayıtları yükleniyor" /> : query.isError ? <ErrorState title="SGK kayıtları alınamadı" message="Kayıtlar yüklenirken bir sorun oluştu." onRetry={() => void query.refetch()} /> : rows.length === 0 ? <EmptyState title={table.search ? 'Sonuç bulunamadı' : 'SGK kaydı bulunamadı'} message={table.search ? 'Arama ölçütünü değiştirip tekrar deneyin.' : 'Onaylanan stajlar SGK kuyruğuna otomatik eklenir.'} /> : <><Table caption="SGK kayıtları" columns={[{ key: 'studentName', header: 'Öğrenci', render: (row) => <span>{String(row.studentName ?? '—')}<small className="ml-1 text-gray-500">{String(row.studentNumber ?? '')}</small></span> }, { key: 'companyName', header: 'Firma' }, { key: 'startDate', header: 'Staj tarihleri', render: (row) => <span>{String(row.startDate ?? '—')} — {String(row.endDate ?? '—')}</span> }, { key: 'status', header: 'Durum', render: (row) => <Badge variant="info">{resolveSgkRowStatus(row, rowStatuses)}</Badge> }, { key: 'actions', header: 'İşlem', render: (row) => { const id = String(row.id); const currentStatus = resolveSgkRowStatus(row, rowStatuses); return <div className="flex items-center gap-2"><Select label={`Durum · ${id}`} value={currentStatus} disabled={currentStatus === 'ACTIVE'} onChange={(event) => void updateStatus(id, event.target.value)} options={getSgkStatusOptions(currentStatus)} /><FileUpload label="Belge" onFilesSelected={(files) => { const file = files[0]; if (file) void uploadDocument(id, file) }} />{row.documentPath ? <button type="button" className="text-sm font-semibold text-navy underline" onClick={() => void downloadDocument(id)}>Belgeyi indir</button> : null}</div> } }]} data={pageRows} rowKey={(row) => String(row.id)} /><Pagination className="mt-4 justify-end" page={Math.min(table.page, totalPages)} totalPages={totalPages} onPageChange={(page) => table.update({ page })} /></>}</div>{message ? <p className="mt-3 text-sm text-navy" role="status">{message}</p> : null}{error ? <p className="mt-3 text-sm text-red" role="alert">{error}</p> : null}</Panel></>
}

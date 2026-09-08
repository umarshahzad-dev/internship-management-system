import { useQuery } from '@tanstack/react-query'
import { DataToolbar, EmptyState, ErrorState, LoadingState, PageHeader, Panel, Pagination, Select, Table } from '../../components/ui'
import { DocumentTitle } from '../../routes/pages'
import { api } from '../../lib/api'
import { useTableUrlState } from '../shared/hooks/useTableUrlState'

interface DomainListPageProps { title: string; description: string; endpoint: string; queryKey: readonly unknown[]; columns?: Array<{ key: string; header: string }> }

export function DomainListPage({ title, description, endpoint, queryKey, columns = [{ key: 'name', header: 'Ad' }] }: DomainListPageProps) {
  const query = useQuery({ queryKey, queryFn: async () => (await api.get<unknown[]>(endpoint)).data })
  const rows = (query.data ?? []) as Array<Record<string, unknown>>
  const table = useTableUrlState()
  const filteredRows = rows.filter((row) => Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(table.search.toLowerCase()))).sort((a, b) => table.sort ? String(a[table.sort] ?? '').localeCompare(String(b[table.sort] ?? '')) : 0)
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / table.pageSize))
  const pageRows = filteredRows.slice((table.page - 1) * table.pageSize, table.page * table.pageSize)
  return <>
    <DocumentTitle title={title} /><PageHeader title={title} description={description} />
    <Panel><DataToolbar search={{ value: table.search, onChange: (value) => table.update({ search: value }), placeholder: 'Kayıtlarda ara' }} filters={<Select label="Sırala" value={table.sort} onChange={(event) => table.update({ sort: event.target.value })} options={columns.map((column) => ({ value: column.key, label: column.header }))} placeholder="Sıralama" />} />{query.isFetching && !query.isLoading ? <p className="mb-2 text-xs text-gray-500" role="status">Liste güncelleniyor…</p> : null}{query.isRefetchError && filteredRows.length > 0 ? <p className="mb-2 text-sm text-red" role="alert">Son güncelleme alınamadı; gösterilen veriler korunuyor.</p> : null}<div className="mt-4">{query.isLoading ? <LoadingState label={`${title} yükleniyor`} /> : query.isError ? <ErrorState title={`${title} alınamadı`} message="Kayıtlar yüklenirken bir sorun oluştu." onRetry={() => void query.refetch()} /> : filteredRows.length === 0 ? <EmptyState title={table.search ? 'Sonuç bulunamadı' : 'Kayıt bulunamadı'} message={table.search ? 'Arama ölçütünü değiştirip tekrar deneyin.' : 'Bu kapsamda görüntülenecek kayıt bulunmuyor.'} /> : <><Table caption={title} columns={columns.map((column) => ({ ...column, render: (row: Record<string, unknown>) => String(row[column.key] ?? '—') }))} data={pageRows} rowKey={(row, index) => String(row.id ?? index)} /><Pagination className="mt-4 justify-end" page={Math.min(table.page, totalPages)} totalPages={totalPages} onPageChange={(page) => table.update({ page })} /></>}</div></Panel>
  </>
}

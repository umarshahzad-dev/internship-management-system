import { useQuery } from '@tanstack/react-query'
import { DataToolbar, EmptyState, ErrorState, LoadingState, PageHeader, Panel, Pagination, Select, Table } from '../../components/ui'
import { api, unwrapPaginated } from '../../lib/api'
import { DocumentTitle } from '../../routes/pages'
import { useTableUrlState } from '../shared/hooks/useTableUrlState'

type CatalogDomain = 'companies' | 'document-types' | 'calendars' | 'holidays'

const catalogs: Record<CatalogDomain, { title: string; endpoint: string; columns: Array<{ key: string; header: string }> }> = {
  companies: { title: 'Firmalar', endpoint: '/companies', columns: [{ key: 'name', header: 'Firma adı' }, { key: 'city', header: 'Şehir' }, { key: 'industry', header: 'Sektör' }, { key: 'isVerified', header: 'Doğrulama' }, { key: 'isActive', header: 'Durum' }] },
  'document-types': { title: 'Belge türleri', endpoint: '/document-types', columns: [{ key: 'name', header: 'Belge adı' }, { key: 'description', header: 'Açıklama' }, { key: 'source', header: 'Kaynak' }, { key: 'isRequired', header: 'Zorunlu' }] },
  calendars: { title: 'Akademik takvimler', endpoint: '/calendars', columns: [{ key: 'termName', header: 'Dönem' }, { key: 'applicationStart', header: 'Başvuru başlangıcı' }, { key: 'applicationEnd', header: 'Başvuru bitişi' }, { key: 'internshipStart', header: 'Staj başlangıcı' }, { key: 'internshipEnd', header: 'Staj bitişi' }] },
  holidays: { title: 'Tatiller', endpoint: '/holidays', columns: [{ key: 'holidayDate', header: 'Tarih' }, { key: 'name', header: 'Açıklama' }] },
}

export function ReadOnlyCatalogPage({ domain }: { domain: CatalogDomain }) {
  const config = catalogs[domain]
  const table = useTableUrlState()
  const query = useQuery({ queryKey: ['catalog', domain], queryFn: async () => unwrapPaginated((await api.get<Array<Record<string, unknown>> | { items: Array<Record<string, unknown>> }>(config.endpoint)).data) })
  const rows = (query.data ?? []).filter((row) => Object.values(row).some((value) => String(value ?? '').toLocaleLowerCase('tr-TR').includes(table.search.toLocaleLowerCase('tr-TR')))).sort((a, b) => String(a[table.sort] ?? '').localeCompare(String(b[table.sort] ?? ''), 'tr-TR', { numeric: true }))
  const totalPages = Math.max(1, Math.ceil(rows.length / table.pageSize))
  const pageRows = rows.slice((table.page - 1) * table.pageSize, table.page * table.pageSize)

  return <>
    <DocumentTitle title={config.title} />
    <PageHeader title={config.title} description="Kurum tarafından yayımlanan kayıtları görüntüleyin." />
    <Panel>
      <DataToolbar search={{ value: table.search, onChange: (search) => table.update({ search, page: 1 }), placeholder: 'Kayıtlarda ara' }} filters={<Select label="Sıralama" value={table.sort} onChange={(event) => table.update({ sort: event.target.value, page: 1 })} options={config.columns.map((column) => ({ value: column.key, label: column.header }))} placeholder="Sıralama" />} />
      <div className="mt-4">
        {query.isLoading ? <LoadingState label="Kayıtlar yükleniyor" /> : query.isError ? <ErrorState title="Kayıtlar alınamadı" message="Kayıtlar yüklenirken bir sorun oluştu." onRetry={() => void query.refetch()} /> : rows.length === 0 ? <EmptyState title={table.search ? 'Sonuç bulunamadı' : 'Kayıt bulunamadı'} message="Arama ölçütünü değiştirip tekrar deneyin." /> : <><Table caption={config.title} columns={config.columns} data={pageRows} rowKey={(row) => String(row.id)} /><Pagination className="mt-4 justify-end" page={Math.min(table.page, totalPages)} totalPages={totalPages} onPageChange={(page) => table.update({ page })} /></>}
      </div>
    </Panel>
  </>
}

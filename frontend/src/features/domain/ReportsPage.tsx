import { Button, ErrorState, PageHeader, Panel } from '../../components/ui'
import { DocumentTitle } from '../../routes/pages'
import { api } from '../../lib/api'
import { downloadBlob } from '../../lib/download-blob'
import { useState } from 'react'

export function ReportsPage() {
  const [error, setError] = useState(false)
  async function downloadReport() { setError(false); try { const response = await api.get<Blob>('/reports/internships/csv', { responseType: 'blob' }); downloadBlob(response.data, 'staj-raporu.csv') } catch { setError(true) } }
  return <><DocumentTitle title="Raporlar" /><PageHeader title="Raporlar" description="Kurum genelindeki staj verilerini dışa aktarın." /><Panel title="Staj raporu"><p className="text-sm text-gray-600">Güncel staj kayıtlarını CSV olarak indirin.</p>{error ? <ErrorState title="Rapor oluşturulamadı" message="Lütfen tekrar deneyin." /> : null}<Button className="mt-4" onClick={() => void downloadReport()}>CSV raporunu indir</Button></Panel></>
}

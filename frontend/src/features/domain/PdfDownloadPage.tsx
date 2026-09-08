import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ErrorState, PageHeader, Panel } from '../../components/ui'
import { DocumentTitle } from '../../routes/pages'
import { api } from '../../lib/api'
import { downloadBlob } from '../../lib/download-blob'

export function PdfDownloadPage({ title, endpoint, filename }: { title: string; endpoint: string; filename: string }) {
  const params = useParams<{ id: string }>()
  const [error, setError] = useState(false)
  async function download() { setError(false); try { const response = await api.get<Blob>(endpoint.replace(':id', params.id ?? ''), { responseType: 'blob' }); downloadBlob(response.data, filename) } catch { setError(true) } }
  return <><DocumentTitle title={title} /><PageHeader title={title} description="Kurumsal belgeyi hazırlayın ve PDF olarak indirin." /><Panel title="Belge hazırla"><p className="text-sm text-gray-600">Belge, güncel staj verileriniz kullanılarak oluşturulur.</p>{error ? <ErrorState title="Belge oluşturulamadı" message="Lütfen tekrar deneyin." /> : null}<Button className="mt-4" onClick={() => void download()}>PDF indir</Button></Panel></>
}

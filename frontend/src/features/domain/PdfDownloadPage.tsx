import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ErrorState, PageHeader, Panel, Select } from '../../components/ui'
import { DocumentTitle } from '../../routes/pages'
import { api, unwrapPaginated } from '../../lib/api'
import { downloadBlob } from '../../lib/download-blob'

export function PdfDownloadPage({ title, endpoint, filename, role }: { title: string; endpoint: string; filename: string; role?: string }) {
  const params = useParams<{ id: string }>()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [studentId, setStudentId] = useState('')
  const [students, setStudents] = useState<Array<{ id: string; firstName: string; lastName: string }>>([])
  useEffect(() => { if (role === 'ADMIN' && title.toLowerCase().includes('zorunlu')) void api.get<Array<{ id: string; firstName: string; lastName: string; role: string }> | { items: Array<{ id: string; firstName: string; lastName: string; role: string }> }>('/users').then((response) => setStudents(unwrapPaginated(response.data).filter((student) => student.role === 'STUDENT'))) }, [role, title])
  async function download() {
    setError(false)
    setLoading(true)
    try {
      const target = endpoint.replace(':id', params.id ?? '') + (role === 'ADMIN' && title.toLowerCase().includes('zorunlu') && studentId ? `?studentId=${encodeURIComponent(studentId)}` : '')
      const response = await api.get<Blob>(target, { responseType: 'blob' })
      downloadBlob(response.data, filename)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }
  return <><DocumentTitle title={title} /><PageHeader title={title} description="Kurumsal belgeyi hazırlayın ve PDF olarak indirin." backHref={params.id ? `/internships/${params.id}` : '/internships'} backLabel="Staj detayına dön" /><Panel title="Belge hazırla"><p className="text-sm text-gray-600">Belge, güncel staj verileriniz kullanılarak oluşturulur.</p>{role === 'ADMIN' && title.toLowerCase().includes('zorunlu') ? <Select className="mt-4" label="Öğrenci seçin" value={studentId} onChange={(event) => setStudentId(event.target.value)} options={students.map((student) => ({ value: student.id, label: `${student.firstName} ${student.lastName}` }))} placeholder="Öğrenci seçin" /> : null}{error ? <ErrorState title="Belge oluşturulamadı" message="Lütfen tekrar deneyin." onRetry={() => void download()} /> : null}<Button className="mt-4" disabled={role === 'ADMIN' && title.toLowerCase().includes('zorunlu') && !studentId} loading={loading} aria-label={`${title} PDF indir`} onClick={() => void download()}>PDF indir</Button>{loading ? <p className="mt-2 text-xs text-gray-500" role="status">PDF hazırlanıyor…</p> : null}</Panel></>
}

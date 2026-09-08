import { useQuery } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { DocumentTitle } from '../../routes/pages'
import { Button, DataToolbar, EmptyState, ErrorState, FileUpload, LoadingState, PageHeader, Panel, Select, Table, Textarea } from '../../components/ui'
import { api } from '../../lib/api'
import { queryKeys } from '../../lib/query-keys'
import type { UserRole } from '../auth/auth.types'

export function InternshipDocumentsPage({ role = 'STUDENT' }: { role?: UserRole }) {
  const { id } = useParams<{ id: string }>()
  const query = useQuery({ queryKey: queryKeys.internships.detail(id ?? ''), queryFn: async () => (await api.get<Array<Record<string, unknown>>>(`/internships/${id}/documents`)).data, enabled: Boolean(id) })
  const documentTypes = useQuery({ queryKey: queryKeys.documentTypes.all, queryFn: async () => (await api.get<Array<{ id: string; name: string; isRequired?: boolean }>>('/document-types')).data, enabled: role === 'STUDENT' })
  const [documentTypeId, setDocumentTypeId] = useState('')
  const [reason, setReason] = useState('')
  const review = useMutation({ mutationFn: ({ documentId, decision }: { documentId: string; decision: 'accept' | 'reject' }) => api.post(`/application-documents/${documentId}/${decision}`, decision === 'reject' ? { reason } : undefined), onSuccess: () => void query.refetch() })
  async function upload(file: File) { const formData = new FormData(); formData.append('file', file); formData.append('documentTypeId', documentTypeId); await api.post(`/internships/${id}/documents`, formData); await query.refetch() }
  return <><DocumentTitle title="Staj belgeleri" /><PageHeader title="Staj belgeleri" description="Başvurunuz için gereken dosyaları yükleyin ve durumlarını izleyin." /><div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]"><Panel title={role === 'STUDENT' ? 'Yeni belge' : 'Belge kontrolü'}>{role === 'STUDENT' ? <><Select label="Belge türü" value={documentTypeId} onChange={(event) => setDocumentTypeId(event.target.value)} options={(documentTypes.data ?? []).map((item) => ({ value: item.id, label: `${item.name}${item.isRequired ? ' · zorunlu' : ''}` }))} /><div className="mt-3"><FileUpload label="Belge dosyası" disabled={!documentTypeId} onFilesSelected={(files) => { const file = files[0]; if (file) void upload(file) }} /></div><p className="mt-3 text-xs text-gray-500">Her yeni yükleme, belge türü için yeni bir versiyon oluşturur.</p></> : <><Textarea label="Red gerekçesi" value={reason} onChange={(event) => setReason(event.target.value)} helperText="Bir belgeyi reddederken gerekçe zorunludur." /></>}</Panel><Panel title="Yüklenen belgeler"><DataToolbar search={{ value: '', onChange: () => undefined, placeholder: 'Belge ara' }} /><div className="mt-4">{query.isLoading ? <LoadingState label="Belgeler yükleniyor" /> : query.isError ? <ErrorState title="Belgeler alınamadı" message="Belgeler yüklenirken bir sorun oluştu." onRetry={() => void query.refetch()} /> : (query.data?.length ?? 0) === 0 ? <EmptyState title="Henüz belge yok" message="İlk belgenizi yüklediğinizde burada görünecek." /> : <Table caption="Staj belgeleri" columns={[{ key: 'originalFilename', header: 'Dosya' }, { key: 'status', header: 'Durum' }, { key: 'versionNumber', header: 'Versiyon' }, ...(role !== 'STUDENT' ? [{ key: 'review', header: 'İnceleme', render: (row: Record<string, unknown>) => <div className="flex gap-2"><Button className="px-2" onClick={() => void review.mutateAsync({ documentId: String(row.id), decision: 'accept' })}>Kabul et</Button><Button variant="danger" className="px-2" onClick={() => void review.mutateAsync({ documentId: String(row.id), decision: 'reject' })}>Reddet</Button></div> }] : [])]} data={query.data ?? []} rowKey={(row) => String(row.id)} />}</div></Panel></div></>
}

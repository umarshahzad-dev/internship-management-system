import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, ErrorState, Input, LoadingState, PageHeader, Panel } from '../../components/ui'
import { DocumentTitle } from '../../routes/pages'
import { api } from '../../lib/api'
import { invalidateDomainQueries } from '../../lib/mutation-invalidation'
import { queryClient } from '../../lib/query-client'
import { queryKeys } from '../../lib/query-keys'

export function ScoringPage() {
  const { internshipId = '' } = useParams<{ internshipId: string }>()
  const [logQuality, setLogQuality] = useState('')
  const [reportQuality, setReportQuality] = useState('')
  const grade = useQuery({ queryKey: ['grades', internshipId], queryFn: async () => (await api.get(`/internships/${internshipId}/grade`)).data, enabled: Boolean(internshipId) })
  const mutation = useMutation({ mutationFn: () => api.post(`/internships/${internshipId}/academic-score`, { logQuality: Number(logQuality), reportQuality: Number(reportQuality) }), onSuccess: () => invalidateDomainQueries(queryClient, [queryKeys.internships.detail(internshipId), ['grades', internshipId]]) })
  return <><DocumentTitle title="Akademik puan" /><PageHeader title="Akademik puan" description="Staj defteri ve rapor kalitesini değerlendirerek akademik puanı kaydedin." /><Panel title="Puan girişi">{grade.isLoading ? <LoadingState label="Mevcut not yükleniyor" /> : <div className="grid gap-4 sm:grid-cols-2"><Input label="Günlük kayıt puanı" type="number" min={0} max={100} value={logQuality} onChange={(event) => setLogQuality(event.target.value)} /><Input label="Rapor puanı" type="number" min={0} max={100} value={reportQuality} onChange={(event) => setReportQuality(event.target.value)} /></div>}{mutation.isError || grade.isError ? <ErrorState title="Puan işlemi tamamlanamadı" message="Kayıtları kontrol edip tekrar deneyin." /> : null}<Button className="mt-5" loading={mutation.isPending} onClick={() => void mutation.mutateAsync()}>Puanı kaydet</Button></Panel></>
}

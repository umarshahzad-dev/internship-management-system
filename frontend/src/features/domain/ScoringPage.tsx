import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, ErrorState, Input, LoadingState, PageHeader, Panel } from '../../components/ui'
import { DocumentTitle } from '../../routes/pages'
import { api } from '../../lib/api'
import { invalidateDomainQueries } from '../../lib/mutation-invalidation'
import { queryClient } from '../../lib/query-client'
import { queryKeys } from '../../lib/query-keys'
import { useEmployerEvaluation, useInternship } from '../internships/internship.queries'

export function ScoringPage() {
  const { internshipId = '' } = useParams<{ internshipId: string }>()
  const [logQuality, setLogQuality] = useState('')
  const [reportQuality, setReportQuality] = useState('')
  const internship = useInternship(internshipId)
  const evaluation = useEmployerEvaluation(internshipId, internship.data?.status === 'EVALUATION')
  const grade = useQuery({ queryKey: ['grades', internshipId], queryFn: async () => (await api.get(`/internships/${internshipId}/grade`)).data, enabled: Boolean(internshipId) })
  const mutation = useMutation({ mutationFn: () => api.post(`/internships/${internshipId}/academic-score`, { logQuality: Number(logQuality), reportQuality: Number(reportQuality) }), onSuccess: () => invalidateDomainQueries(queryClient, [queryKeys.internships.detail(internshipId), ['grades', internshipId]]) })
  const ready = internship.data?.status === 'EVALUATION' && Boolean(evaluation.data)
  return <><DocumentTitle title="Akademik puan" /><PageHeader title="Akademik puan" description="Staj defteri ve rapor kalitesini değerlendirerek akademik puanı kaydedin." backHref={internshipId ? `/internships/${internshipId}` : '/internships'} backLabel="Staj detayına dön" /><Panel title="Puan girişi">{internship.isLoading || grade.isLoading || (internship.data?.status === 'EVALUATION' && evaluation.isLoading) ? <LoadingState label="Değerlendirme ve mevcut not yükleniyor" /> : internship.isError ? <ErrorState title="Staj bulunamadı" message="Puan ekranı için staj bilgisi alınamadı." onRetry={() => void internship.refetch()} /> : internship.data?.status !== 'EVALUATION' ? <p className="text-sm text-gray-600">Akademik puan yalnızca işveren değerlendirmesi alınmış EVALUATION aşamasında girilebilir.</p> : evaluation.isError ? <ErrorState title="İşveren değerlendirmesi bekleniyor" message="Puan girişi için işveren değerlendirmesinin tamamlanması gerekir." onRetry={() => void evaluation.refetch()} /> : ready ? <><div className="mb-4 border-l-4 border-gold bg-gold/10 p-3 text-sm text-gray-700">İşveren değerlendirmesi alındı. Aşağıdaki puanlar akademik değerlendirmeye eklenir.</div><div className="grid gap-4 sm:grid-cols-2"><Input label="Günlük kayıt puanı" type="number" min={0} max={100} value={logQuality} onChange={(event) => setLogQuality(event.target.value)} /><Input label="Rapor puanı" type="number" min={0} max={100} value={reportQuality} onChange={(event) => setReportQuality(event.target.value)} /></div>{mutation.isError || grade.isError ? <ErrorState title="Puan işlemi tamamlanamadı" message="Kayıtları kontrol edip tekrar deneyin." /> : null}<Button className="mt-5" loading={mutation.isPending} disabled={!logQuality || !reportQuality} onClick={() => void mutation.mutateAsync()}>Puanı kaydet</Button></> : null}</Panel></>
}

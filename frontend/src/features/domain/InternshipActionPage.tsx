import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { Button, ConfirmDialog, ErrorState, PageHeader, Panel, Textarea } from '../../components/ui'
import { DocumentTitle } from '../../routes/pages'
import { useInternshipAction } from '../internships/internship.queries'

export function InternshipActionPage({ action, title }: { action: 'approve' | 'reject' | 'request-revision' | 'transition-to-ongoing' | 'finalize'; title: string }) {
  const { id = '' } = useParams<{ id: string }>()
  const mutation = useInternshipAction(id, action)
  const [reason, setReason] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const requiresReason = action === 'reject' || action === 'request-revision'
  return <><DocumentTitle title={title} /><PageHeader title={title} description="İşlemi onaylamadan önce kayıt bilgilerini kontrol edin." backHref={id ? `/internships/${id}` : '/internships'} backLabel="Staj detayına dön" /><Panel title="İşlem onayı"><p className="text-sm text-gray-600">Bu işlem stajın durumunu değiştirecektir.</p>{requiresReason ? <Textarea label="Gerekçe" value={reason} onChange={(event) => setReason(event.target.value)} className="mt-4" placeholder="Gerekçenizi yazın" /> : null}{mutation.isError ? <ErrorState title="İşlem tamamlanamadı" message="Lütfen bilgileri kontrol edip tekrar deneyin." /> : null}<Button className="mt-4" loading={mutation.isPending} onClick={() => setConfirmOpen(true)}>İşlemi tamamla</Button></Panel><ConfirmDialog open={confirmOpen} title={`${title} işlemini onayla`} description={requiresReason && !reason.trim() ? 'Devam etmeden önce bir gerekçe girin.' : 'Bu işlem geri alınamayabilir. Devam etmek istiyor musunuz?'} confirmLabel="İşlemi onayla" onCancel={() => setConfirmOpen(false)} onConfirm={() => { if (requiresReason && !reason.trim()) return; setConfirmOpen(false); void mutation.mutateAsync(reason ? { reason } : undefined) }} /></>
}

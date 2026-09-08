import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ErrorState, Input, PageHeader, Panel } from '../../../components/ui'
import { publicApi, normalizeApiError } from '../../../lib/api'
import { DocumentTitle } from '../../../routes/pages'

export function EmployerApprovalPage() {
  const { token = '' } = useParams<{ token: string }>()
  const [sgkNumber, setSgkNumber] = useState(''); const [iban, setIban] = useState(''); const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle'); const [message, setMessage] = useState('')
  async function approve() { setState('loading'); try { await publicApi.post('/public/internship/employer-approve', { token, sgkNumber: sgkNumber || undefined, iban: iban || undefined }); setState('success') } catch (error) { setMessage(normalizeApiError(error).message); setState('error') } }
  return <main className="mx-auto flex min-h-screen max-w-2xl items-center p-6"><DocumentTitle title="İşveren onayı" /><div className="w-full"><PageHeader title="İşveren onayı" description="Staj başvurusunu kurum bilgilerini doğrulayarak onaylayın." /><Panel title="Onay bilgileri">{state === 'success' ? <div className="border-l-4 border-gold bg-gold/10 px-4 py-4 text-sm font-semibold text-navy" role="status">Staj başvurusu başarıyla onaylandı.</div> : state === 'error' ? <ErrorState title="Onay tamamlanamadı" message={message} onRetry={() => setState('idle')} /> : <><div className="grid gap-4 sm:grid-cols-2"><Input label="SGK numarası (isteğe bağlı)" value={sgkNumber} onChange={(event) => setSgkNumber(event.target.value)} /><Input label="IBAN (isteğe bağlı)" value={iban} onChange={(event) => setIban(event.target.value)} /></div><Button className="mt-5" loading={state === 'loading'} onClick={() => void approve()}>Stajı onayla</Button><p className="mt-3 text-xs text-gray-500">Bu bağlantı yalnızca yetkili işveren tokenı ile kullanılabilir.</p></>}</Panel></div></main>
}

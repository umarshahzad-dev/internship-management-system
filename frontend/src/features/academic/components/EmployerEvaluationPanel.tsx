import { useState } from 'react'
import { Button, Input, Panel, Textarea } from '../../../components/ui'
import { api } from '../../../lib/api'

export function EmployerEvaluationPanel({ internshipId }: { internshipId: string }) {
  const [employerName, setEmployerName] = useState(''); const [comments, setComments] = useState(''); const [link, setLink] = useState(''); const [error, setError] = useState('')
  async function generateLink() { try { const response = await api.post<{ plainToken: string; expiresAt: string }>(`/internships/${internshipId}/employer-evaluation/generate-link`); setLink(`${window.location.origin}/employer/evaluate/${response.data.plainToken}`) } catch { setError('Değerlendirme bağlantısı oluşturulamadı.') } }
  async function submitManual() { const data = new FormData(); data.append('employerName', employerName); data.append('comments', comments); data.append('grades', '{}'); try { await api.post(`/internships/${internshipId}/employer-evaluation/manual`, data); setError('') } catch { setError('Manuel değerlendirme kaydedilemedi.') } }
  return <Panel className="mt-4" title="İşveren değerlendirmesi" description="İşveren bağlantısı oluşturun veya taranmış formu manuel kaydedin."><div className="flex flex-wrap gap-2"><Button onClick={() => void generateLink()}>Değerlendirme bağlantısı oluştur</Button>{link ? <a className="self-center text-sm font-semibold text-navy underline" href={link}>{link}</a> : null}</div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Input label="İşveren adı" value={employerName} onChange={(event) => setEmployerName(event.target.value)} /><Textarea label="Yorumlar" value={comments} onChange={(event) => setComments(event.target.value)} /></div><Button className="mt-3" variant="outline" onClick={() => void submitManual()}>Manuel değerlendirmeyi kaydet</Button>{error ? <p className="mt-2 text-sm text-red" role="alert">{error}</p> : null}</Panel>
}

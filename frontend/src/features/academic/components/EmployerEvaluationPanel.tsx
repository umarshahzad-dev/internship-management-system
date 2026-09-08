import { useState } from 'react'
import { Button, FileUpload, Input, Panel, Select, Textarea } from '../../../components/ui'
import { api } from '../../../lib/api'

export const employerEvaluationCriteria = [
  ['attendance', 'Devam durumu'], ['effort', 'Çaba ve sorumluluk'], ['timeliness', 'Zamanında tamamlama'], ['conduct', 'Mesleki davranış'], ['teamwork', 'Takım çalışması'], ['ethics', 'Etik ve güvenilirlik'], ['self_improvement', 'Kendini geliştirme'],
] as const
const letters = ['A', 'B', 'C', 'D', 'E']

export function EmployerEvaluationPanel({ internshipId }: { internshipId: string }) {
  const [employerName, setEmployerName] = useState(''); const [comments, setComments] = useState(''); const [link, setLink] = useState(''); const [error, setError] = useState(''); const [scannedFile, setScannedFile] = useState<File | null>(null); const [grades, setGrades] = useState<Record<string, string>>({})
  async function generateLink() { try { const response = await api.post<{ plainToken: string; expiresAt: string }>(`/internships/${internshipId}/employer-evaluation/generate-link`); setLink(`${window.location.origin}/employer/evaluate/${response.data.plainToken}`) } catch { setError('Değerlendirme bağlantısı oluşturulamadı.') } }
  async function submitManual() { const data = new FormData(); data.append('employerName', employerName); data.append('comments', comments); data.append('grades', JSON.stringify(grades)); if (scannedFile) data.append('scannedSicilFisi', scannedFile); try { await api.post(`/internships/${internshipId}/employer-evaluation/manual`, data); setError('') } catch { setError('Manuel değerlendirme kaydedilemedi.') } }
  const complete = employerEvaluationCriteria.every(([key]) => grades[key])
  return <Panel className="mt-4" title="İşveren değerlendirmesi" description="Bağlantı oluşturun veya yedi kriterli değerlendirmeyi manuel kaydedin."><div className="flex flex-wrap gap-2"><Button onClick={() => void generateLink()}>Değerlendirme bağlantısı oluştur</Button>{link ? <a className="self-center text-sm font-semibold text-navy underline" href={link}>{link}</a> : null}</div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Input label="İşveren adı" value={employerName} onChange={(event) => setEmployerName(event.target.value)} />{employerEvaluationCriteria.map(([key, label]) => <Select key={key} label={label} value={grades[key] ?? ''} onChange={(event) => setGrades({ ...grades, [key]: event.target.value })} options={letters.map((letter) => ({ value: letter, label: letter }))} placeholder="Not seçin" />)}<Textarea label="Yorumlar (isteğe bağlı)" value={comments} onChange={(event) => setComments(event.target.value)} /><FileUpload label="Taranmış sicil fişi (isteğe bağlı)" accept=".pdf,.jpg,.png" onFilesSelected={(files) => setScannedFile(files[0] ?? null)} /></div><Button className="mt-3" variant="outline" disabled={!complete || !employerName.trim()} onClick={() => void submitManual()}>Manuel değerlendirmeyi kaydet</Button>{!complete ? <p className="mt-2 text-xs text-gray-500">Kayıt için yedi kriterin tamamını puanlayın.</p> : null}{error ? <p className="mt-2 text-sm text-red" role="alert">{error}</p> : null}</Panel>
}

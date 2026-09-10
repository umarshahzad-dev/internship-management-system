import type { DailyLog } from './internship.types'

export interface DailyLogDay {
  date: string
  entries: DailyLog[]
}

export interface RequiredDocumentType {
  id: string
  name: string
  isRequired?: boolean
  source?: string
}

export interface ApplicationDocument {
  id: string
  documentTypeId?: string
  documentType?: { id?: string; name?: string; isRequired?: boolean }
  documentTypeName?: string
  documentTypeIsRequired?: boolean
  documentTypeSource?: string
  originalFilename?: string
  status?: string
  versionNumber?: number
}

/** Build the latest status for every required external-upload document type. */
export function buildDocumentChecklist(types: RequiredDocumentType[], documents: ApplicationDocument[]) {
  return types
    .filter((type) => type.isRequired && (type.source ?? 'EXTERNAL_UPLOAD') === 'EXTERNAL_UPLOAD')
    .map((type) => {
      const versions = documents.filter((document) => document.documentTypeId === type.id || document.documentType?.id === type.id)
      const latest = [...versions].sort((a, b) => (b.versionNumber ?? 0) - (a.versionNumber ?? 0))[0]
      return { ...type, status: latest?.status ?? 'PENDING', versionNumber: latest?.versionNumber ?? 0 }
    })
}

export function groupDailyLogs(logs: DailyLog[]): DailyLogDay[] {
  const grouped = new Map<string, DailyLog[]>()
  for (const log of logs) grouped.set(log.logDate, [...(grouped.get(log.logDate) ?? []), log])
  return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, entries]) => ({ date, entries }))
}

export const studentOperationsDocuments = [
  { label: 'Zorunlu Staj Belgesi', endpoint: '/internships/documents/zorunlu-staj-belgesi', kind: 'generated', guidance: 'Başvuru öncesi sistemden oluşturulur.' },
  { label: 'Staj Başvuru Formu', endpoint: '/internships/:id/application-form', kind: 'generated', guidance: 'Başvuru gönderildikten sonra güncel bilgilerle oluşturulur.' },
  { label: 'Staj Ücretlerine İşsizlik Fonu Katkısı', endpoint: null, kind: 'template', href: '/templates/official/issizlik-fonu-bilgi-formu.pdf', guidance: 'Öğrenci ve işveren tarafından imzalanır.' },
  { label: 'Uzaktan Mesleki Staj Evrak', endpoint: null, kind: 'template', guidance: 'Uzaktan staj uygulanıyorsa bölüm yönergesine göre yükleyin.' },
  { label: 'Müstehaklık Belgesi', endpoint: null, kind: 'upload', guidance: 'e-Devlet üzerinden alınan güncel belgeyi yükleyin.' },
  { label: 'Kimlik Fotokopisi', endpoint: null, kind: 'upload', guidance: 'Kimlik ön yüzünü okunaklı PDF/JPG olarak yükleyin.' },
] as const

export const officialTemplateDocuments = [
  { label: 'Zorunlu staj dilekçesi', href: '/templates/official/zorunlu-staj-dilekcesi.pdf' },
  { label: 'Zorunlu staj başvuru formu (Ek 1)', href: '/templates/official/zorunlu-staj-basvuru-formu.docx' },
  { label: 'Staj defteri iç kapak', href: '/templates/official/staj-ic-kapak.pdf' },
  { label: 'Staj defteri sayfası', href: '/templates/official/staj-defter-sayfasi.docx' },
  { label: 'Pratik sicil fişi', href: '/templates/official/staj-sicil-fisi.docx' },
  { label: 'Staj defteri kapak', href: '/templates/official/staj-defteri-kapak.docx' },
] as const

/** Resolve a frontend document route only when the corresponding backend route can be called. */
export function resolveStudentDocumentHref(endpoint: string | null, internshipId?: string) {
  if (!endpoint) return undefined
  if (endpoint.includes(':id') && !internshipId) return undefined
  return endpoint.replace(':id', internshipId ?? '')
}

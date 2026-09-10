import { Download, ExternalLink, FileCheck2, FileText, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader, Panel, Select } from '../../../components/ui'
import { DocumentTitle } from '../../../routes/pages'
import { buildDocumentChecklist, officialTemplateDocuments, resolveStudentDocumentHref, studentOperationsDocuments } from '../../internships/priority3'
import { useCompanies, useInternshipDocuments, useInternships, useRequiredDocumentTypes } from '../../internships/internship.queries'

const completionStatuses = new Set(['EVALUATION', 'GRADED', 'COMPLETED'])

function statusVariant(status: string) {
  if (status === 'ACCEPTED') return 'success' as const
  if (status === 'REJECTED') return 'danger' as const
  return 'warning' as const
}

export function StudentOperationsPage() {
  const companies = useCompanies()
  const internships = useInternships()
  const [selectedId, setSelectedId] = useState('')
  const internshipId = selectedId || internships.data?.[0]?.id
  const selectedInternship = internships.data?.find((item) => item.id === internshipId) ?? internships.data?.[0]
  const documents = useInternshipDocuments(internshipId)
  const documentTypes = useRequiredDocumentTypes()
  const checklist = useMemo(() => buildDocumentChecklist(documentTypes.data ?? [], documents.data ?? []), [documentTypes.data, documents.data])
  const missing = checklist.filter((item) => item.status !== 'ACCEPTED')
  const defterAvailable = Boolean(selectedInternship && completionStatuses.has(selectedInternship.status))

  return <>
    <DocumentTitle title="Staj işlemleri" />
    <PageHeader title="Staj işlemleri" description="KTUN staj sürecindeki resmi belgeler, kurum rehberi ve başvuru kontrolü." />
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <Panel title="Sistem duyuruları" description="Başvuru takvimi ve belge teslimi için güncel hatırlatmalar.">
        <div className="border-l-4 border-gold bg-gold/10 p-4 text-sm leading-6 text-gray-700">Başvurunuzu komisyona göndermeden önce zorunlu harici belgelerin son sürümünü yükleyin ve kabul durumunu kontrol edin. Başvuru pencereleri akademik takvimde duyurulur.</div>
      </Panel>
      <Panel title="Hızlı bağlantılar">
        <div className="grid gap-2">
          <NavLink to="/companies" className="flex items-center gap-2 border border-gray-200 px-3 py-2 text-sm font-semibold text-navy hover:border-red"><FileText className="h-4 w-4 text-red" aria-hidden="true" />Kurum listesini görüntüle</NavLink>
          <NavLink to="/internships" className="flex items-center gap-2 border border-gray-200 px-3 py-2 text-sm font-semibold text-navy hover:border-red"><FileCheck2 className="h-4 w-4 text-red" aria-hidden="true" />Başvurularım ve staj defterim</NavLink>
        </div>
      </Panel>
    </div>
    <Panel className="mt-4" title="Başvuru belge kontrolü" description="Her staj başvurusu için zorunlu dış yüklemelerin en son sürümünü takip edin.">
      {internships.isLoading ? <LoadingState label="Başvurular yükleniyor" /> : internships.isError ? <ErrorState title="Başvurular alınamadı" message="Belge kontrolü için başvurularınız yüklenemedi." onRetry={() => void internships.refetch()} /> : !internships.data?.length ? <EmptyState title="Henüz staj başvurunuz yok" message="Belge kontrolünü görmek için önce yeni bir staj başvurusu oluşturun." /> : <>
        <div className="max-w-xl"><Select label="Kontrol edilecek staj" value={internshipId ?? ''} onChange={(event) => setSelectedId(event.target.value)} options={(internships.data ?? []).map((item) => ({ value: item.id, label: `${item.companyName ?? item.companyId ?? 'Kurum'} · ${item.startDate}` }))} /></div>
        {documents.isLoading || documentTypes.isLoading ? <div className="mt-4"><LoadingState label="Belge durumları yükleniyor" /></div> : documents.isError || documentTypes.isError ? <div className="mt-4"><ErrorState title="Belge durumu alınamadı" message="Belge kontrolü şu anda görüntülenemiyor." onRetry={() => { void documents.refetch(); void documentTypes.refetch() }} /></div> : <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{checklist.length === 0 ? <p className="text-sm text-gray-500">Bu bölüm için zorunlu harici belge türü tanımlanmamış.</p> : checklist.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border border-gray-200 bg-white px-3 py-3 text-sm"><span className="font-medium text-navy">{item.name}</span><Badge variant={statusVariant(item.status)}>{item.status} · v{item.versionNumber}</Badge></div>)}</div>
          {missing.length > 0 ? <div className="mt-4 flex items-start gap-2 border-l-4 border-red bg-red/5 p-3 text-sm text-gray-700"><Upload className="mt-0.5 h-4 w-4 shrink-0 text-red" aria-hidden="true" /><span>Gönderimden önce {missing.length} zorunlu belgeyi kabul edilmek üzere <NavLink className="font-semibold text-navy underline" to={internshipId ? `/internships/${internshipId}/documents` : '/internships'}>belge ekranından yükleyin</NavLink>.</span></div> : <p className="mt-4 text-sm font-semibold text-green-700">Zorunlu belgeler kabul edildi; başvurunuz gönderime hazır.</p>}
        </>}
      </>}
    </Panel>
    <Panel className="mt-4" title="Resmi belge ve şablonlar" description="KTUN staj yönergesinde kullanılan belgeleri yerel olarak indirin; sistem dışı formları işvereninizle imzalayın.">
      <div className="grid gap-2 md:grid-cols-2">
        {studentOperationsDocuments.map((document) => { const href = resolveStudentDocumentHref(document.endpoint, internshipId); return <div key={document.label} className="flex items-start justify-between gap-3 border-b border-gray-100 py-3 text-sm"><div><p className="font-semibold text-navy">{document.label}</p><p className="mt-1 text-xs text-gray-500">{document.guidance}</p></div>{href ? <NavLink className="inline-flex shrink-0 items-center gap-1 font-semibold text-navy underline" to={href}><Download className="h-4 w-4" aria-hidden="true" />Oluştur</NavLink> : null}</div> })}
        {officialTemplateDocuments.map((document) => <div key={document.href} className="flex items-center justify-between gap-3 border-b border-gray-100 py-3 text-sm"><span className="font-medium text-navy">{document.label}</span><a className="inline-flex shrink-0 items-center gap-1 font-semibold text-navy underline" href={document.href} download><Download className="h-4 w-4" aria-hidden="true" />Şablonu indir</a></div>)}
        {defterAvailable ? <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-3 text-sm"><span className="font-semibold text-navy">Staj defteri (sistem üretimi)</span><NavLink className="inline-flex items-center gap-1 font-semibold text-red underline" to={internshipId ? `/internships/${internshipId}/staj-defteri` : '/internships'}><Download className="h-4 w-4" aria-hidden="true" />PDF indir</NavLink></div> : <div className="flex items-center gap-2 border-b border-gray-100 py-3 text-sm text-gray-500"><ExternalLink className="h-4 w-4" aria-hidden="true" />Staj defteri, değerlendirme aşamasından sonra erişime açılır.</div>}
      </div>
    </Panel>
    <Panel className="mt-4" title="Kurum rehberi" description="Başvurunuz için aktif işverenleri inceleyin.">
      {companies.isError ? <p className="text-sm text-red" role="alert">Kurum listesi şu anda alınamadı.</p> : <p className="text-sm font-semibold text-navy">{companies.isLoading ? 'Kurumlar yükleniyor…' : `${companies.data?.length ?? 0} aktif kurum listeleniyor.`}</p>}
      <NavLink className="mt-3 inline-flex text-sm font-semibold text-navy underline" to="/companies">Kurumları görüntüle</NavLink>
    </Panel>
  </>
}

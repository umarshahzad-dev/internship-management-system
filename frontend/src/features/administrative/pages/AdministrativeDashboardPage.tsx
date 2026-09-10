import { NavLink } from 'react-router-dom'
import { Panel, PageHeader } from '../../../components/ui'
import { DocumentTitle } from '../../../routes/pages'
import { AnnouncementPanel } from '../../announcement/components/AnnouncementPanel'

export function AdministrativeDashboardPage() {
  return <>
    <DocumentTitle title="İdari çalışma alanı" />
    <PageHeader title="İdari çalışma alanı" description="Bölümünüze otomatik olarak atanan SGK kayıtlarını yönetin." />
    <AnnouncementPanel />
    <Panel title="SGK işlem kuyruğu" description="Belge yükleme, durum güncelleme ve stajı başlatma işlemlerini SGK kaydı üzerinden yürütün.">
      <NavLink to="/sgk" className="mt-3 inline-flex text-sm font-semibold text-navy underline">SGK işlemlerine git</NavLink>
    </Panel>
  </>
}

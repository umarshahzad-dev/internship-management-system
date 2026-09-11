import { useEffect } from 'react'
import { Panel, PageHeader } from '../components/ui'
import { PublicLayout } from '../layout/PublicLayout'

export interface RoutePageProps { title: string; description?: string }

export function DocumentTitle({ title }: { title: string }) {
  useEffect(() => { document.title = `${title} | KTÜN IMAS` }, [title])
  return null
}

export function RoutePage({ title, description = 'Bu çalışma alanı ilgili iş akışı hazır olduğunda burada görüntülenecektir.' }: RoutePageProps) {
  return <><DocumentTitle title={title} /><PageHeader title={title} description={description} /><Panel title="İşlem alanı"><p className="text-sm text-gray-500">İçerik ve işlemler yetkinize göre gösterilecektir.</p></Panel></>
}

export function PublicRoutePage({ title, description }: RoutePageProps) {
  return <PublicLayout><main className="flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-xl"><DocumentTitle title={title} /><div className="mb-4 flex items-center gap-3"><div className="grid h-10 w-9 place-items-center bg-red text-[10px] font-bold text-white">KTÜN</div><div><p className="text-sm font-bold text-navy">IMAS</p><p className="text-xs text-gray-500">Konya Teknik Üniversitesi</p></div></div><Panel><PageHeader title={title} description={description} /></Panel></div></main></PublicLayout>
}

export function ForbiddenPage() {
  return <div role="alert" aria-label="Erişim yetkiniz yok"><DocumentTitle title="Erişim engellendi (403)" /><PageHeader title="Erişim engellendi (403)" description="Bu çalışma alanını görüntülemek için gerekli yetkiye sahip değilsiniz." /><Panel title="Yetki gerekli"><p className="text-sm text-gray-500">Hesabınızın rolü bu işlem için yetkili değil.</p></Panel></div>
}

export function NotFoundPage() {
  return <><DocumentTitle title="Sayfa bulunamadı (404)" /><PageHeader title="Sayfa bulunamadı (404)" description="Aradığınız çalışma alanı mevcut değil." /><Panel title="Bağlantıyı kontrol edin"><p className="text-sm text-gray-500">Adresin doğru olduğundan emin olun ve tekrar deneyin.</p></Panel></>
}

export function RouteErrorPage() {
  return <PublicLayout><main className="flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-xl"><DocumentTitle title="Bir hata oluştu" /><Panel><PageHeader title="Bir hata oluştu" description="İşlem beklenmedik bir nedenle tamamlanamadı." /></Panel></div></main></PublicLayout>
}

export function MaintenancePage() {
  return <PublicLayout><main className="flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-xl"><DocumentTitle title="Sistem bakımı" /><Panel><PageHeader title="Sistem şu anda bakımda" description="Lütfen daha sonra tekrar deneyin." /></Panel></div></main></PublicLayout>
}

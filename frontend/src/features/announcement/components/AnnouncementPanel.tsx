import { Panel, LoadingState, ErrorState, EmptyState } from '../../../components/ui'
import { useAnnouncements } from '../hooks'

export function AnnouncementPanel() {
  const query = useAnnouncements()
  return <Panel title="Duyurular" description="Bölümünüze ve rolünüze uygun güncel duyurular.">
    {query.isLoading ? <LoadingState label="Duyurular yükleniyor" /> : query.isError ? <ErrorState title="Duyurular alınamadı" message="Duyurular şu anda kullanılamıyor." onRetry={() => void query.refetch()} /> : query.data?.length ? <div className="divide-y divide-gray-100">{query.data.map((item) => <article key={item.id} className="py-3 first:pt-0 last:pb-0"><p className="text-sm font-semibold text-navy">{item.title}</p><p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{item.content}</p></article>)}</div> : <EmptyState title="Güncel duyuru yok" message="Yeni bir duyuru yayınlandığında burada görünecek." />}
  </Panel>
}

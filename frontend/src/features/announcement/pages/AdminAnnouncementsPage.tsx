import { useState } from 'react'
import { Button, ConfirmDialog, ErrorState, Input, LoadingState, PageHeader, Panel, Textarea } from '../../../components/ui'
import { DocumentTitle } from '../../../routes/pages'
import { useAdminAnnouncements, useCreateAnnouncement, useDeleteAnnouncement, useUpdateAnnouncement } from '../hooks'
import type { Announcement } from '../api/announcement.api'

export function AdminAnnouncementsPage() {
  const list = useAdminAnnouncements(); const create = useCreateAnnouncement(); const update = useUpdateAnnouncement(); const remove = useDeleteAnnouncement()
  const [editing, setEditing] = useState<Announcement | null>(null); const [title, setTitle] = useState(''); const [content, setContent] = useState(''); const [confirmId, setConfirmId] = useState<string | null>(null)
  const open = (item?: Announcement) => { setEditing(item ?? null); setTitle(item?.title ?? ''); setContent(item?.content ?? '') }
  const save = async () => { if (!title.trim() || !content.trim()) return; const payload = { title: title.trim(), content: content.trim(), targetRoles: ['STUDENT', 'ACADEMIC', 'ADMINISTRATIVE'], departmentId: null, expiresAt: null, isActive: true }; if (editing) await update.mutateAsync({ id: editing.id, payload }); else await create.mutateAsync(payload); setEditing(null); setTitle(''); setContent('') }
  return <><DocumentTitle title="Duyurular" /><PageHeader title="Duyurular" description="Kurum duyurularını yayınlayın ve güncel tutun." actions={<Button onClick={() => open()}>Yeni duyuru</Button>} /><Panel>{list.isLoading ? <LoadingState label="Duyurular yükleniyor" /> : list.isError ? <ErrorState title="Duyurular alınamadı" message="Liste yüklenemedi." onRetry={() => void list.refetch()} /> : <div className="space-y-3">{list.data?.map((item) => <div key={item.id} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3"><div><p className="font-semibold text-navy">{item.title}</p><p className="mt-1 text-sm text-gray-600">{item.content}</p></div><div className="flex shrink-0 gap-2"><Button variant="secondary" onClick={() => open(item)}>Düzenle</Button><Button variant="danger" onClick={() => setConfirmId(item.id)}>Sil</Button></div></div>)}</div>}</Panel>
    {editing !== null || title || content ? <Panel title={editing ? 'Duyuruyu düzenle' : 'Yeni duyuru'} className="mt-4"><div className="grid gap-3"><Input label="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} /><Textarea label="İçerik" value={content} onChange={(e) => setContent(e.target.value)} /><div className="flex gap-2"><Button loading={create.isPending || update.isPending} onClick={() => void save()}>Kaydet</Button><Button variant="secondary" onClick={() => { setEditing(null); setTitle(''); setContent('') }}>Vazgeç</Button></div></div></Panel> : null}
    <ConfirmDialog open={Boolean(confirmId)} title="Duyuruyu sil" description="Bu duyuru kalıcı olarak silinecek." confirmLabel="Sil" variant="danger" loading={remove.isPending} onCancel={() => setConfirmId(null)} onConfirm={() => confirmId ? void remove.mutateAsync(confirmId).then(() => setConfirmId(null)) : undefined} />
  </>
}

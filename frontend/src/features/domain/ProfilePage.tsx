import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, ErrorState, Input, LoadingState, PageHeader, Panel } from '../../components/ui'
import { DocumentTitle } from '../../routes/pages'
import { api } from '../../lib/api'
import { invalidateDomainQueries } from '../../lib/mutation-invalidation'
import { queryClient } from '../../lib/query-client'
import { queryKeys } from '../../lib/query-keys'

export function ProfilePage() {
  const profile = useQuery({ queryKey: ['profile'], queryFn: async () => (await api.get<Record<string, string>>('/auth/me')).data })
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const mutation = useMutation({ mutationFn: () => api.patch('/users/me', { firstName, lastName }), onSuccess: () => invalidateDomainQueries(queryClient, [queryKeys.auth.me, ['profile']]) })
  if (profile.isLoading) return <><DocumentTitle title="Profilim" /><LoadingState label="Profil yükleniyor" /></>
  if (profile.isError || !profile.data) return <><DocumentTitle title="Profilim" /><ErrorState title="Profil alınamadı" message="Profil bilgileri yüklenirken bir sorun oluştu." onRetry={() => void profile.refetch()} /></>
  const user = profile.data
  return <><DocumentTitle title="Profilim" /><PageHeader title="Profilim" description="Kişisel bilgilerinizi güncel tutun." /><Panel title="Kişisel bilgiler"><div className="grid gap-4 sm:grid-cols-2"><Input label="Ad" defaultValue={user.firstName ?? ''} onChange={(event) => setFirstName(event.target.value)} /><Input label="Soyad" defaultValue={user.lastName ?? ''} onChange={(event) => setLastName(event.target.value)} /></div>{mutation.isError ? <p className="mt-3 text-sm text-red" role="alert">Profil güncellenemedi.</p> : null}<Button className="mt-5" loading={mutation.isPending} onClick={() => void mutation.mutateAsync()}>Değişiklikleri kaydet</Button></Panel></>
}

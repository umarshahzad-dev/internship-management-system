import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { announcementApi } from '../api/announcement.api'

const key = ['announcements']
export const useAnnouncements = () => useQuery({ queryKey: key, queryFn: announcementApi.list })
export const useAdminAnnouncements = () => useQuery({ queryKey: [...key, 'admin'], queryFn: announcementApi.listAdmin })
export const useCreateAnnouncement = () => { const qc = useQueryClient(); return useMutation({ mutationFn: announcementApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: key }) }) }
export const useUpdateAnnouncement = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof announcementApi.update>[1] }) => announcementApi.update(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: key }) }) }
export const useDeleteAnnouncement = () => { const qc = useQueryClient(); return useMutation({ mutationFn: announcementApi.remove, onSuccess: () => qc.invalidateQueries({ queryKey: key }) }) }

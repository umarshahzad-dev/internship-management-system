import { api } from '../../../lib/api'

export interface Announcement {
  id: string
  title: string
  content: string
  targetRoles: string[]
  departmentId: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const announcementApi = {
  list: async () => (await api.get<Announcement[]>('/announcements')).data,
  listAdmin: async () => (await api.get<Announcement[]>('/announcements/admin')).data,
  create: async (payload: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => (await api.post<Announcement>('/announcements', payload)).data,
  update: async (id: string, payload: Partial<Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>>) => (await api.patch<Announcement>(`/announcements/${id}`, payload)).data,
  remove: async (id: string) => { await api.delete(`/announcements/${id}`) },
}

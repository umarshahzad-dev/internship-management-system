import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { invalidateDomainQueries } from '../../lib/mutation-invalidation'
import { queryKeys } from '../../lib/query-keys'
import type { DailyLog, InternshipDetail, InternshipListItem } from './internship.types'

export function useInternships() {
  return useQuery({
    queryKey: queryKeys.internships.all,
    queryFn: async () => (await api.get<InternshipListItem[]>('/internships')).data,
  })
}

export function useInternship(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.internships.detail(id ?? ''),
    queryFn: async () => (await api.get<InternshipDetail>(`/internships/${id}`)).data,
    enabled: Boolean(id),
  })
}

export function useDailyLogs(internshipId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.dailyLogs.list(internshipId ?? ''),
    queryFn: async () => (await api.get<DailyLog[]>(`/internships/${internshipId}/daily-logs`)).data,
    enabled: Boolean(internshipId),
  })
}

export function useCreateDailyLog(internshipId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Pick<DailyLog, 'logDate' | 'content'>) => api.post(`/internships/${internshipId}/daily-logs`, payload),
    onSuccess: () => invalidateDomainQueries(queryClient, [queryKeys.dailyLogs.list(internshipId), queryKeys.internships.detail(internshipId)]),
  })
}

export function useUpdateDailyLog(internshipId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; logDate?: string; content?: string }) => api.patch(`/daily-logs/${id}`, payload),
    onSuccess: () => invalidateDomainQueries(queryClient, [queryKeys.dailyLogs.list(internshipId)]),
  })
}

export function useInternshipAction(internshipId: string, action: 'submit' | 'withdraw' | 'approve' | 'reject' | 'request-revision' | 'complete' | 'finalize' | 'transition-to-ongoing') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload?: Record<string, unknown>) => api.post(`/internships/${internshipId}/${action}`, payload),
    onSuccess: () => invalidateDomainQueries(queryClient, [queryKeys.internships.all, queryKeys.internships.detail(internshipId)]),
  })
}

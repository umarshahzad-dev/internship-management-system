import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, unwrapPaginated } from '../../lib/api'
import { invalidateDomainQueries } from '../../lib/mutation-invalidation'
import { queryKeys } from '../../lib/query-keys'
import type { DailyLog, InternshipDetail, InternshipListItem } from './internship.types'
import type { ApplicationDocument, RequiredDocumentType } from './priority3'

export interface CompanyListItem {
  id: string
  name: string
  city?: string | null
  industry?: string | null
  isActive?: boolean
}

export function useInternships(departmentId?: string | null) {
  return useQuery({
    queryKey: [...queryKeys.internships.all, departmentId ?? 'self'],
    queryFn: async () => unwrapPaginated((await api.get<InternshipListItem[] | { items: InternshipListItem[] }>('/internships', departmentId ? { headers: { 'X-Department-Id': departmentId } } : undefined)).data),
    enabled: departmentId !== null,
  })
}

export function useCompanies(enabled = true) {
  return useQuery({
    queryKey: queryKeys.companies.all,
    queryFn: async () => unwrapPaginated((await api.get<CompanyListItem[] | { items: CompanyListItem[] }>('/companies')).data),
    enabled,
  })
}

export function useInternship(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.internships.detail(id ?? ''),
    queryFn: async () => (await api.get<InternshipDetail>(`/internships/${id}`)).data,
    enabled: Boolean(id),
  })
}

export function useDailyLogs(internshipId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.dailyLogs.list(internshipId ?? ''),
    queryFn: async () => (await api.get<DailyLog[]>(`/internships/${internshipId}/daily-logs`)).data,
    enabled: Boolean(internshipId) && enabled,
  })
}

export function useInternshipDocuments(internshipId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.internships.detail(internshipId ?? ''), 'documents'],
    queryFn: async () => (await api.get<ApplicationDocument[]>(`/internships/${internshipId}/documents`)).data,
    enabled: Boolean(internshipId) && enabled,
  })
}

export function useRequiredDocumentTypes(enabled = true) {
  return useQuery({
    queryKey: queryKeys.documentTypes.all,
    queryFn: async () => unwrapPaginated((await api.get<RequiredDocumentType[] | { items: RequiredDocumentType[] }>('/document-types')).data),
    enabled,
  })
}

export interface EmployerEvaluation {
  employerName: string
  method: string
  grades: Record<string, string>
  comments: string | null
  submittedAt: string
  employerLogsApprovedAt?: string | null
}

export function useEmployerEvaluation(internshipId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['employer-evaluation', internshipId ?? ''],
    queryFn: async () => (await api.get<EmployerEvaluation>(`/internships/${internshipId}/employer-evaluation`)).data,
    enabled: Boolean(internshipId) && enabled,
  })
}

export function useFinalGrade(internshipId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['final-grade', internshipId ?? ''],
    queryFn: async () => (await api.get<{ employerScore: number; academicScore: number; finalScore: number; letterGrade: string }>(`/internships/${internshipId}/grade`)).data,
    enabled: Boolean(internshipId) && enabled,
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

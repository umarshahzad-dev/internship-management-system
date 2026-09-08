import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { queryClient as defaultQueryClient } from '../../lib/query-client'
import { getDepartmentScope, setDepartmentScope } from '../../lib/department-scope'

const departmentScopedDomains = new Set([
  'departments',
  'internships',
  'daily-logs',
  'application-documents',
  'companies',
  'users',
  'sgk',
  'reports',
])

export function isDepartmentScopedQueryKey(queryKey: readonly unknown[]) {
  return typeof queryKey[0] === 'string' && departmentScopedDomains.has(queryKey[0])
}

export function invalidateDepartmentScopedQueries(client: QueryClient = defaultQueryClient) {
  return client.invalidateQueries({ predicate: (query) => isDepartmentScopedQueryKey(query.queryKey) })
}

interface AdminDepartmentContextValue {
  departmentId: string | null
  setDepartmentId: (departmentId: string | null) => void
}

const AdminDepartmentContext = createContext<AdminDepartmentContextValue | null>(null)

export interface AdminDepartmentProviderProps {
  children: ReactNode
  initialDepartmentId?: string | null
  queryClient?: QueryClient
}

export function AdminDepartmentProvider({ children, initialDepartmentId = null, queryClient = defaultQueryClient }: AdminDepartmentProviderProps) {
  const [departmentId, setDepartmentIdState] = useState<string | null>(() => initialDepartmentId ?? getDepartmentScope())

  const setDepartmentId = useCallback((nextDepartmentId: string | null) => {
    setDepartmentIdState((currentDepartmentId) => {
      if (currentDepartmentId !== nextDepartmentId) void invalidateDepartmentScopedQueries(queryClient)
      setDepartmentScope(nextDepartmentId)
      return nextDepartmentId
    })
  }, [queryClient])

  const value = useMemo(() => ({ departmentId, setDepartmentId }), [departmentId, setDepartmentId])
  return <AdminDepartmentContext.Provider value={value}>{children}</AdminDepartmentContext.Provider>
}

// oxlint-disable-next-line react(only-export-components)
export function useAdminDepartment() {
  const context = useContext(AdminDepartmentContext)
  if (!context) throw new Error('useAdminDepartment must be used inside AdminDepartmentProvider')
  return context
}

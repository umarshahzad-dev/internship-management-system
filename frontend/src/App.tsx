import { BrowserRouter } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { UserRole } from './features/auth/auth.types'
import { AuthProvider } from './features/auth/auth-context'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query-client'
import { AppRoutes } from './routes/AppRoutes'
import { AdminDepartmentProvider } from './features/departments/department-context'

export interface AppProps {
  isAuthenticated?: boolean
  role?: UserRole
}

function App({ isAuthenticated, role }: AppProps) {
  const hasOverride = isAuthenticated !== undefined
  return (
    <AuthProvider restoreSession={!hasOverride}>
      <QueryClientProvider client={queryClient}>
        <AdminDepartmentProvider>
          <BrowserRouter><AppRoutes isAuthenticated={isAuthenticated} role={role} /></BrowserRouter>
          {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
        </AdminDepartmentProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App

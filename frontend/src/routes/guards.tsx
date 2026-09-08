import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ForbiddenPage } from './pages'
import type { UserRole } from '../features/auth/auth.types'
import { LoadingState } from '../components/ui/LoadingState'

export interface AuthGuardProps {
  isAuthenticated: boolean
  isLoading?: boolean
}

export function AuthGuard({ isAuthenticated, isLoading = false }: AuthGuardProps) {
  const location = useLocation()
  if (isLoading) return <LoadingState label="Oturum doğrulanıyor" />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export interface RoleGuardProps {
  role: UserRole
  allowedRoles: UserRole[]
  children: ReactNode
}

export function RoleGuard({ role, allowedRoles, children }: RoleGuardProps) {
  if (!allowedRoles.includes(role)) return <ForbiddenPage />
  return <>{children}</>
}

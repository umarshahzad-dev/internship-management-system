import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../../lib/api'
import { csrfStore } from '../../lib/csrf-store'
import { queryClient } from '../../lib/query-client'
import { queryKeys } from '../../lib/query-keys'
import { invalidateDomainQueries } from '../../lib/mutation-invalidation'
import { login as authLogin } from './auth.service'
import type { LoginRequest, UserProfile } from './auth.types'

interface CsrfResponse { csrfToken: string }

export interface AuthContextValue {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  csrfToken: string | null
  login: (credentials: LoginRequest) => Promise<UserProfile>
  logout: () => Promise<void>
  refreshSession: () => Promise<UserProfile | null>
  setSessionUser: (user: UserProfile) => void
}

export interface AuthProviderProps {
  children: ReactNode
  initialUser?: UserProfile | null
  restoreSession?: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children, initialUser = null, restoreSession = true }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(initialUser)
  const [isLoading, setIsLoading] = useState(restoreSession)
  const [csrfToken, setCsrfTokenState] = useState(csrfStore.getToken())

  const setCsrfToken = useCallback((token: string | null) => {
    csrfStore.setToken(token)
    setCsrfTokenState(token)
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const { data: nextUser } = await api.get<UserProfile>('/auth/me')
      setUser(nextUser)
      const { data } = await api.get<CsrfResponse>('/auth/csrf')
      setCsrfToken(data.csrfToken)
      return nextUser
    } catch {
      setUser(null)
      setCsrfToken(null)
      return null
    }
  }, [setCsrfToken])

  useEffect(() => {
    if (!restoreSession) return undefined
    let active = true
    // Session restoration is an external synchronization; clear the loading gate when it settles.
    const finishRestore = () => { if (active) setIsLoading(false) }
    void refreshSession().then(finishRestore, finishRestore)
    return () => { active = false }
  }, [refreshSession, restoreSession])

  const login = useCallback(async (credentials: LoginRequest) => {
    const nextUser = await authLogin(credentials)
    setUser(nextUser)
    setCsrfToken(csrfStore.getToken())
    return nextUser
  }, [setCsrfToken])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } finally {
      setUser(null)
      setCsrfToken(null)
      await invalidateDomainQueries(queryClient, [queryKeys.auth.me])
    }
  }, [setCsrfToken])

  const setSessionUser = useCallback((nextUser: UserProfile) => {
    setUser(nextUser)
    setCsrfToken(csrfStore.getToken())
  }, [setCsrfToken])

  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), isLoading, csrfToken, login, logout, refreshSession, setSessionUser }), [csrfToken, isLoading, login, logout, refreshSession, setSessionUser, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react(only-export-components)
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

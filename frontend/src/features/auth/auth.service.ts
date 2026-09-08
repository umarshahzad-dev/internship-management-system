import { api } from '../../lib/api'
import { csrfStore } from '../../lib/csrf-store'
import type { LoginRequest, LoginResponse, UserProfile } from './auth.types'

interface CsrfResponse { csrfToken: string }

export async function login(credentials: LoginRequest): Promise<UserProfile> {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials)
  if (data.csrfToken) csrfStore.setToken(data.csrfToken)
  const csrfResponse = await api.get<CsrfResponse>('/auth/csrf')
  csrfStore.setToken(csrfResponse.data.csrfToken)
  return data.user
}

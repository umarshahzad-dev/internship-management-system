import axios from 'axios'
import { csrfStore } from './csrf-store'
import { getDepartmentScope } from './department-scope'

const mutationMethods = new Set(['post', 'patch', 'put', 'delete'])
const apiBaseUrl = import.meta.env.VITE_API_URL || '/api/v1'

function getPublicApiBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/api\/v1\/?$/, '') || '/'
}

export interface NormalizedApiError {
  code: string
  message: string
  status?: number
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  const response = (error as { response?: { status?: number; data?: { error?: { code?: unknown; message?: unknown } } } }).response
  const domainError = response?.data?.error

  if (typeof domainError?.message === 'string') {
    return {
      code: typeof domainError.code === 'string' ? domainError.code : 'API_ERROR',
      message: domainError.message,
      status: response?.status,
    }
  }

  return {
    code: 'REQUEST_FAILED',
    message: 'İşleminiz tamamlanamadı. Lütfen tekrar deneyiniz.',
    status: response?.status,
  }
}

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
})

export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL || getPublicApiBaseUrl(apiBaseUrl),
})

api.interceptors.request.use((config) => {
  const departmentId = getDepartmentScope()
  if (departmentId) config.headers.set('X-Department-Id', departmentId)
  if (config.method && mutationMethods.has(config.method.toLowerCase())) {
    const csrfToken = csrfStore.getToken()
    if (csrfToken) config.headers.set('X-CSRF-Token', csrfToken)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url === '/auth/login'
    const isSessionProbe = error.config?.url === '/auth/me'
    if (error.response?.status === 401 && !isLoginRequest && !isSessionProbe && window.location.pathname !== '/login') {
      csrfStore.clear()
      window.location.assign('/login')
    }
    return Promise.reject(normalizeApiError(error))
  },
)

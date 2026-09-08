import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { api } from '../../lib/api'
import { csrfStore } from '../../lib/csrf-store'
import { AuthProvider, useAuth } from './auth-context'
import type { UserProfile } from './auth.types'

function Probe() {
  const auth = useAuth()
  return <div><span data-testid="loading">{String(auth.isLoading)}</span><span data-testid="authenticated">{String(auth.isAuthenticated)}</span><span data-testid="user">{auth.user?.email ?? 'none'}</span><span data-testid="csrf">{auth.csrfToken ?? 'none'}</span><button onClick={() => auth.logout()}>Çıkış</button></div>
}

function LoginProbe() {
  const auth = useAuth()
  return <><button onClick={() => void auth.login({ email: 'admin@example.com', password: 'Test1234' })}>Giriş</button><span data-testid="authenticated">{String(auth.isAuthenticated)}</span><span data-testid="user">{auth.user?.email ?? 'none'}</span></>
}

describe('AuthProvider session lifecycle', () => {
  afterEach(() => { vi.restoreAllMocks(); csrfStore.clear() })

  it('restores the cookie session and refreshes the in-memory CSRF token', async () => {
    vi.spyOn(api, 'get').mockImplementation(async (url) => url === '/auth/me'
      ? { data: { id: 'u1', email: 'student@ktun.edu.tr', firstName: 'Ayşe', lastName: 'Yılmaz', role: 'STUDENT', departmentId: null, profilePhotoPath: null } }
      : { data: { csrfToken: 'csrf-restored' } })

    render(<AuthProvider><Probe /></AuthProvider>)
    expect(await screen.findByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('user')).toHaveTextContent('student@ktun.edu.tr')
    expect(screen.getByTestId('csrf')).toHaveTextContent('csrf-restored')
    expect(csrfStore.getToken()).toBe('csrf-restored')
  })

  it('clears the session and CSRF token on logout', async () => {
    csrfStore.setToken('csrf-active')
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: { id: 'u1', email: 'user@ktun.edu.tr', firstName: 'Test', lastName: 'User', role: 'STUDENT', departmentId: null, profilePhotoPath: null } })
    vi.spyOn(api, 'post').mockResolvedValue({ data: {} })

    render(<AuthProvider><Probe /></AuthProvider>)
    await screen.findByText('user@ktun.edu.tr')
    await userEvent.click(screen.getByRole('button', { name: 'Çıkış' }))
    expect(api.post).toHaveBeenCalledWith('/auth/logout')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(csrfStore.getToken()).toBeNull()
    expect(get).toHaveBeenCalled()
  })

  it('does not let a late session probe overwrite a successful login', async () => {
    let resolveMe!: (value: { data: UserProfile }) => void
    const delayedMe = new Promise<{ data: UserProfile }>((resolve) => { resolveMe = resolve })
    vi.spyOn(api, 'get').mockImplementation(async (url) => {
      if (url === '/auth/me') return delayedMe
      return { data: { csrfToken: 'csrf-login' } } as never
    })
    vi.spyOn(api, 'post').mockResolvedValue({ data: { user: { id: 'admin-1', email: 'admin@example.com', firstName: 'System', lastName: 'Admin', role: 'ADMIN', departmentId: null, profilePhotoPath: null }, csrfToken: 'csrf-login' } } as never)

    const user = userEvent.setup()
    render(<AuthProvider><LoginProbe /></AuthProvider>)
    await user.click(screen.getByRole('button', { name: 'Giriş' }))
    expect(screen.getByTestId('user')).toHaveTextContent('admin@example.com')

    resolveMe({ data: { id: 'stale', email: 'stale@example.com', firstName: 'Stale', lastName: 'Probe', role: 'STUDENT', departmentId: null, profilePhotoPath: null } })
    await screen.findByTestId('authenticated')
    expect(screen.getByTestId('user')).toHaveTextContent('admin@example.com')
  })
})

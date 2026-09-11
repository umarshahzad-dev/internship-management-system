import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../App'
import { api } from '../lib/api'
import { canAccessRoute } from './route-permissions'

describe('Phase 3 routing and permissions', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/login')
  })
  afterEach(() => vi.restoreAllMocks())

  it('serves public employer token and verification routes without the authenticated shell', () => {
    window.history.pushState({}, '', '/employer/evaluate/demo-token')
    render(<App />)

    expect(screen.getByRole('heading', { name: 'İşveren değerlendirmesi' })).toBeVisible()
    expect(screen.queryByRole('navigation', { name: 'Ana menü' })).not.toBeInTheDocument()
  })

  it('redirects unauthenticated users from protected routes to login', () => {
    window.history.pushState({}, '', '/internships')
    render(<App isAuthenticated={false} />)

    expect(screen.getByRole('heading', { name: 'Oturum aç' })).toBeVisible()
    expect(window.location.pathname).toBe('/login')
  })

  it('redirects legacy calendar and holidays routes to the unified calendar page', () => {
    window.history.pushState({}, '', '/calendars')
    const { unmount } = render(<App isAuthenticated role="ADMIN" />)
    expect(window.location.pathname).toBe('/calendar')
    unmount()

    window.history.pushState({}, '', '/holidays')
    render(<App isAuthenticated role="ADMIN" />)
    expect(window.location.pathname).toBe('/calendar')
  })

  it('renders the institutional shell and student navigation for an authenticated user', () => {
    window.history.pushState({}, '', '/dashboard')
    render(<App isAuthenticated role="STUDENT" />)

    expect(screen.getByRole('navigation', { name: 'Ana menü' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Öğrenci çalışma alanı' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Stajlarım' })).toHaveAttribute('href', '/internships')
  })

  it('enforces role permissions and permits the same route for administrators', () => {
    window.history.pushState({}, '', '/users')
    const { unmount } = render(<App isAuthenticated role="STUDENT" />)
    expect(screen.getByRole('alert', { name: 'Erişim yetkiniz yok' })).toBeVisible()
    unmount()

    window.history.pushState({}, '', '/users')
    render(<App isAuthenticated role="ADMIN" />)
    expect(screen.getByRole('heading', { name: 'Kullanıcı yönetimi' })).toBeVisible()
  })

  it('allows every authenticated role to open its own profile', () => {
    expect(canAccessRoute('profile', 'ADMIN')).toBe(true)
    expect(canAccessRoute('profile', 'ACADEMIC')).toBe(true)
    expect(canAccessRoute('profile', 'ADMINISTRATIVE')).toBe(true)
  })

  it('supports logout navigation from the authenticated shell', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'post').mockResolvedValue({ data: {} } as never)
    window.history.pushState({}, '', '/dashboard')
    render(<App isAuthenticated role="ACADEMIC" />)

    await user.click(screen.getByRole('button', { name: 'Oturumu kapat' }))
    expect(await screen.findByRole('heading', { name: 'Oturum aç' })).toBeVisible()
  })

  it('redirects to the dashboard after a successful browser login', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'get').mockImplementation(async (url) => {
      if (url === '/auth/me') throw new Error('no active session')
      return { data: { csrfToken: 'csrf-login' } } as never
    })
    vi.spyOn(api, 'post').mockResolvedValue({ data: { user: { id: 'admin-1', email: 'admin@example.com', firstName: 'System', lastName: 'Admin', role: 'ADMIN', departmentId: null, profilePhotoPath: null }, csrfToken: 'csrf-login' } } as never)

    render(<App />)
    await user.type(screen.getByLabelText('E-posta adresi'), 'admin@example.com')
    await user.type(screen.getByLabelText('Şifre'), 'Test1234')
    await user.click(screen.getByRole('button', { name: 'Giriş yap' }))

    await screen.findByRole('heading', { name: 'Yönetim çalışma alanı' })
    expect(window.location.pathname).toBe('/dashboard')
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '../App'

describe('Phase 3 routing and permissions', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/login')
  })

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

  it('supports logout navigation from the authenticated shell', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/dashboard')
    render(<App isAuthenticated role="ACADEMIC" />)

    await user.click(screen.getByRole('button', { name: 'Oturumu kapat' }))
    expect(screen.getByRole('heading', { name: 'Oturum aç' })).toBeVisible()
  })
})

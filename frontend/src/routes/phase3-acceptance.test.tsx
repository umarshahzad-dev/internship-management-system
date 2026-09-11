import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '../App'
import { MobileNavigation } from '../layout/MobileNavigation'
import { RouteErrorPage } from './pages'
import { canAccessRoute, ROUTE_PERMISSIONS } from './route-permissions'

describe('Phase 3 routing acceptance criteria', () => {
  beforeEach(() => window.history.pushState({}, '', '/login'))

  it('uses a dedicated public layout and sets the document title', () => {
    window.history.pushState({}, '', '/forgot-password')
    render(<App />)

    expect(screen.getByTestId('public-layout')).toBeVisible()
    expect(document.title).toBe('Şifre yenileme | KTÜN IMAS')
  })

  it('opens and closes a keyboard-accessible mobile navigation drawer', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><MobileNavigation role="STUDENT" /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'Menüyü aç' }))
    expect(screen.getByRole('dialog', { name: 'Mobil menü' })).toBeVisible()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Mobil menü' })).not.toBeInTheDocument()
  })

  it('renders distinct forbidden, not-found, and route-error pages', () => {
    window.history.pushState({}, '', '/users')
    const { unmount } = render(<App isAuthenticated role="STUDENT" />)
    expect(screen.getByRole('heading', { name: 'Erişim engellendi (403)' })).toBeVisible()
    unmount()

    window.history.pushState({}, '', '/does-not-exist')
    const missing = render(<App isAuthenticated role="STUDENT" />)
    expect(screen.getByRole('heading', { name: 'Sayfa bulunamadı (404)' })).toBeVisible()
    missing.unmount()

    render(<RouteErrorPage />)
    expect(screen.getByRole('heading', { name: 'Bir hata oluştu' })).toBeVisible()
  })

  it('uses one permission map for route access decisions', () => {
    expect(canAccessRoute('users', 'ADMIN')).toBe(true)
    expect(canAccessRoute('users', 'STUDENT')).toBe(false)
    expect(ROUTE_PERMISSIONS.companies).toContain('STUDENT')
    expect(ROUTE_PERMISSIONS.companies).toContain('ADMIN')
    expect(canAccessRoute('internships', 'ADMIN')).toBe(false)
    expect(canAccessRoute('internshipDetail', 'ADMINISTRATIVE')).toBe(false)
    expect(canAccessRoute('sgk', 'ACADEMIC')).toBe(false)
    expect(canAccessRoute('sgk', 'ADMINISTRATIVE')).toBe(true)
    expect(canAccessRoute('systemConfigs', 'ACADEMIC')).toBe(false)
    expect(canAccessRoute('calendars', 'ADMINISTRATIVE')).toBe(false)
    expect(canAccessRoute('stajDefteri', 'STUDENT')).toBe(true)
    expect(canAccessRoute('stajDefteri', 'ACADEMIC')).toBe(false)
  })

  it('denies direct URLs that are outside the active role capability set', () => {
    window.history.pushState({}, '', '/internships')
    const adminInternships = render(<App isAuthenticated role="ADMIN" />)
    expect(screen.getByRole('heading', { name: 'Erişim engellendi (403)' })).toBeVisible()
    adminInternships.unmount()

    window.history.pushState({}, '', '/sgk')
    const academicSgk = render(<App isAuthenticated role="ACADEMIC" />)
    expect(screen.getByRole('heading', { name: 'Erişim engellendi (403)' })).toBeVisible()
    academicSgk.unmount()

    window.history.pushState({}, '', '/system-configs')
    render(<App isAuthenticated role="ACADEMIC" />)
    expect(screen.getByRole('heading', { name: 'Erişim engellendi (403)' })).toBeVisible()
  })

  it('gives Student users a read-only company directory', () => {
    window.history.pushState({}, '', '/companies')
    render(<App isAuthenticated role="STUDENT" />)

    expect(screen.getByRole('heading', { name: 'Firmalar' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Oluştur' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Düzenle' })).not.toBeInTheDocument()
  })

  it('updates document titles for authenticated route changes', () => {
    window.history.pushState({}, '', '/dashboard')
    render(<App isAuthenticated role="ACADEMIC" />)
    expect(document.title).toBe('Akademik çalışma alanı | KTÜN IMAS')
  })
})

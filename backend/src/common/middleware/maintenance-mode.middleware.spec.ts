import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MaintenanceModeMiddleware } from './maintenance-mode.middleware'

describe('MaintenanceModeMiddleware', () => {
  let sessions: { findOne: ReturnType<typeof vi.fn> }
  let users: { findOne: ReturnType<typeof vi.fn> }
  let configs: { findOne: ReturnType<typeof vi.fn> }
  let middleware: MaintenanceModeMiddleware

  beforeEach(() => {
    sessions = { findOne: vi.fn() }
    users = { findOne: vi.fn() }
    configs = { findOne: vi.fn().mockResolvedValue({ value: 'true' }) }
    middleware = new MaintenanceModeMiddleware(sessions as never, users as never, configs as never)
  })

  it('allows admin sessions, blocks students, and keeps health/login available', async () => {
    const next = vi.fn()
    const json = vi.fn()
    const status = vi.fn().mockReturnValue({ json })
    sessions.findOne.mockResolvedValue({ userId: 'admin-id', revokedAt: null, expiresAt: new Date(Date.now() + 60_000) })
    users.findOne.mockResolvedValue({ role: 'ADMIN', isActive: true })

    await middleware.use({ originalUrl: '/api/v1/admin/internships', headers: { cookie: 'imas_session=session-id' }, cookies: {} } as never, { status } as never, next)
    expect(next).toHaveBeenCalledOnce()

    next.mockClear()
    users.findOne.mockResolvedValue({ role: 'STUDENT', isActive: true })
    await middleware.use({ originalUrl: '/api/v1/internships', headers: { cookie: 'imas_session=session-id' }, cookies: {} } as never, { status } as never, next)
    expect(status).toHaveBeenCalledWith(503)
    expect(json).toHaveBeenCalledWith({ error: { code: 'MAINTENANCE_MODE', message: 'Sistem bakım nedeniyle geçici olarak kapalıdır.' } })

    next.mockClear()
    await middleware.use({ originalUrl: '/api/v1/health', headers: {}, cookies: {} } as never, { status } as never, next)
    await middleware.use({ originalUrl: '/api/v1/auth/login', headers: {}, cookies: {} } as never, { status } as never, next)
    expect(next).toHaveBeenCalledTimes(2)
  })
})

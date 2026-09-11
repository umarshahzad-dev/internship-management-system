import { Injectable, NestMiddleware } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { Request, Response, NextFunction } from 'express'
import { Repository } from 'typeorm'
import { SessionEntity } from '../../infrastructure/database/entities/session.entity'
import { UserEntity } from '../../infrastructure/database/entities/user.entity'
import { SystemConfigEntity } from '../../infrastructure/database/entities/system-config.entity'

@Injectable()
export class MaintenanceModeMiddleware implements NestMiddleware {
  private static instances = new Set<MaintenanceModeMiddleware>()
  private cached: { value: boolean; expiresAt: number } | null = null
  constructor(@InjectRepository(SessionEntity) private readonly sessions: Repository<SessionEntity>, @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>, @InjectRepository(SystemConfigEntity) private readonly configs: Repository<SystemConfigEntity>) { MaintenanceModeMiddleware.instances.add(this) }
  async use(req: Request, res: Response, next: NextFunction) {
    const path = (req.originalUrl ?? req.path).split('?')[0].replace(/^\/api\/v1/, '')
    if (new Set(['/health', '/db-health', '/auth/login', '/auth/logout', '/system-configs/admin']).has(path)) return next()
    if (req.headers.authorization?.startsWith('Bearer ')) return next()
    const value = await this.enabled(); if (!value) return next()
    const sessionId = req.cookies?.imas_session ?? req.headers.cookie?.match(/(?:^|;\s*)imas_session=([^;]+)/)?.[1]
    if (sessionId) { const session = await this.sessions.findOne({ where: { id: sessionId } }); if (session && !session.revokedAt && session.expiresAt > new Date()) { const user = await this.users.findOne({ where: { id: session.userId } }); if (user?.role === 'ADMIN' && user.isActive) return next() } }
    return res.status(503).json({ error: { code: 'MAINTENANCE_MODE', message: 'Sistem bakım nedeniyle geçici olarak kapalıdır.' } })
  }
  private async enabled() { if (this.cached && this.cached.expiresAt > Date.now()) return this.cached.value; const row = await this.configs.findOne({ where: { key: 'MAINTENANCE_MODE' } }); const value = String(row?.value).toLowerCase() === 'true'; this.cached = { value, expiresAt: Date.now() + 30_000 }; return value }
  invalidate() { this.cached = null }
  static invalidateAll() { for (const instance of MaintenanceModeMiddleware.instances) instance.invalidate() }
}

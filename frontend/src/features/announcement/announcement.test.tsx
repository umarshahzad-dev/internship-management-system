import { describe, expect, it } from 'vitest'
import { canAccessRoute } from '../../routes/route-permissions'
import { canReviewDocuments, canViewDailyLogs } from '../../routes/capabilities'

describe('audit permission boundaries', () => {
  it('exposes announcements only to administrators', () => {
    expect(canAccessRoute('announcements', 'ADMIN')).toBe(true)
    expect(canAccessRoute('announcements', 'ACADEMIC')).toBe(false)
  })

  it('keeps document review and log visibility scoped by role and lifecycle', () => {
    expect(canReviewDocuments('ACADEMIC', 'PENDING')).toBe(true)
    expect(canReviewDocuments('STUDENT', 'PENDING')).toBe(false)
    expect(canViewDailyLogs('ACADEMIC', 'PENDING_COMMISSION')).toBe(false)
    expect(canViewDailyLogs('ACADEMIC', 'EVALUATION')).toBe(true)
  })
})

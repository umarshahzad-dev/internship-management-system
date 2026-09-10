import { describe, expect, it } from 'vitest'
import { canRoleViewDailyLogs } from './priority5'

describe('Priority 5 permission-aware queries', () => {
  it('only allows Academic daily-log reads after evaluation begins', () => {
    expect(canRoleViewDailyLogs('STUDENT', 'DRAFT')).toBe(true)
    expect(canRoleViewDailyLogs('ACADEMIC', 'PENDING_COMMISSION')).toBe(false)
    expect(canRoleViewDailyLogs('ACADEMIC', 'EVALUATION')).toBe(true)
    expect(canRoleViewDailyLogs('ACADEMIC', 'GRADED')).toBe(true)
    expect(canRoleViewDailyLogs('ADMIN', 'COMPLETED')).toBe(false)
  })
})

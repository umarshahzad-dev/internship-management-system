import { describe, expect, it, vi } from 'vitest'
import { invalidateDomainQueries } from './mutation-invalidation'

describe('mutation invalidation helpers', () => {
  it('invalidates each related domain query key after a successful mutation', async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined)
    await invalidateDomainQueries({ invalidateQueries } as never, [
      ['internships'],
      ['daily-logs', 'internship-1'],
    ])

    expect(invalidateQueries).toHaveBeenNthCalledWith(1, { queryKey: ['internships'] })
    expect(invalidateQueries).toHaveBeenNthCalledWith(2, { queryKey: ['daily-logs', 'internship-1'] })
  })
})

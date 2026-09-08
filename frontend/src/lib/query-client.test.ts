import { describe, expect, it } from 'vitest'
import { queryClient } from './query-client'
import { queryKeys } from './query-keys'

describe('React Query foundation', () => {
  it('uses the documented cache defaults and hierarchical query keys', () => {
    const defaults = queryClient.getDefaultOptions().queries!
    expect(defaults.staleTime).toBe(5 * 60 * 1000)
    expect(defaults.gcTime).toBe(30 * 60 * 1000)
    expect(queryKeys.auth.me).toEqual(['auth', 'me'])
    expect(queryKeys.internships.detail('internship-1')).toEqual(['internships', 'internship-1'])
    expect(queryKeys.dailyLogs.list('internship-1')).toEqual(['daily-logs', 'internship-1'])
  })
})

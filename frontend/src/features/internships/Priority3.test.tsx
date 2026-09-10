import { describe, expect, it } from 'vitest'
import { groupDailyLogs, studentOperationsDocuments } from './priority3'

describe('Priority 3 student workflow helpers', () => {
  it('groups daily logs by date for a date-first timeline', () => {
    const grouped = groupDailyLogs([
      { id: '1', internshipId: 'i', logDate: '2026-07-02', content: 'İkinci gün' },
      { id: '2', internshipId: 'i', logDate: '2026-07-01', content: 'İlk gün' },
      { id: '3', internshipId: 'i', logDate: '2026-07-02', content: 'Öğleden sonra' },
    ])
    expect(grouped.map((day) => day.date)).toEqual(['2026-07-01', '2026-07-02'])
    expect(grouped[1].entries).toHaveLength(2)
  })

  it('exposes the mandated student operations document checklist', () => {
    expect(studentOperationsDocuments).toHaveLength(6)
    expect(studentOperationsDocuments.map((item) => item.label)).toContain('Zorunlu Staj Belgesi')
  })
})

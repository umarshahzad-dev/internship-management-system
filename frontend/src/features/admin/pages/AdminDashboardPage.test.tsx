import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../../lib/api'
import { AdminDepartmentProvider } from '../../departments/department-context'
import { AdminDashboardPage } from './AdminDashboardPage'

const summary = {
  term: { id: 'term-1', name: '2026-2027 Güz' },
  kpis: { totalApplications: 1245, pendingSgk: 14, activeInternships: 482, completed: 615, activeCompanies: 68, pendingActions: 53, rejectedOrRevision: 13, activeUsers: 340 },
  statusDistribution: [{ status: 'DRAFT', label: 'Öğrenci Başvuru Taslağı', count: 84 }],
  departmentDistribution: [{ departmentId: 'dep-1', name: 'Bilgisayar Mühendisliği', total: 290, active: 115, completed: 142 }],
  departmentDistributionTotals: { total: 290, active: 115, completed: 142 },
  warnings: [], activePipelinePercentage: 92.4, totalFiles: 1245, lastSyncAt: new Date().toISOString(),
}

describe('AdminDashboardPage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders eight clickable KPI cards from the dashboard summary', async () => {
    vi.spyOn(api, 'get').mockImplementation(async (url) => {
      if (url === '/departments') return { data: [] } as never
      if (url === '/admin/dashboard-summary') return { data: summary } as never
      return { data: [] } as never
    })
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<MemoryRouter><QueryClientProvider client={client}><AdminDepartmentProvider><AdminDashboardPage /></AdminDepartmentProvider></QueryClientProvider></MemoryRouter>)

    expect((await screen.findAllByText('TOPLAM BAŞVURU'))[0]).toBeVisible()
    for (const label of ['SGK BEKLEYEN', 'AKTİF STAJLAR', 'TAMAMLANAN', 'AKTİF FİRMA SAYISI', 'İŞLEM BEKLEYEN', 'REDDEDİLEN BAŞVURU', 'SİSTEM KULLANICI SAYISI']) expect(screen.getAllByText(label)[0]).toBeVisible()
    expect(screen.queryByText('KAYITLI FİRMA SAYISI')).not.toBeInTheDocument()
    expect(screen.queryByText('SİSTEM KULLANICI SAYISI')).toBeVisible()
    expect(screen.getAllByRole('link')).toEqual(expect.arrayContaining([expect.objectContaining({ href: expect.stringContaining('/admin/internships') })]))
  })

  it('renders warnings only when the backend returns them', async () => {
    vi.spyOn(api, 'get').mockImplementation(async (url) => {
      if (url === '/departments') return { data: [] } as never
      if (url === '/admin/dashboard-summary') return { data: { ...summary, warnings: ['SGK girişi için bekleyen 14 başvuru var.'] } } as never
      return { data: [] } as never
    })
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<MemoryRouter><QueryClientProvider client={client}><AdminDepartmentProvider><AdminDashboardPage /></AdminDepartmentProvider></QueryClientProvider></MemoryRouter>)

    expect(await screen.findByText('SGK girişi için bekleyen 14 başvuru var.')).toBeVisible()
    expect(screen.getByText('YÜKSEK ÖNCELİK')).toBeVisible()
  })
})

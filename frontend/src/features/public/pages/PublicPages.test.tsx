import { render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { publicApi } from '../../../lib/api'
import { EmployerEvaluationPage } from './EmployerEvaluationPage'
import { PublicVerificationPage } from './PublicVerificationPage'

function renderRoute(element: ReactNode, path: string) {
  return render(<QueryClientProvider client={new QueryClient()}><MemoryRouter initialEntries={[path]}><Routes><Route path="/employer/evaluate/:token" element={element} /><Route path="/verify/:internshipId" element={element} /></Routes></MemoryRouter></QueryClientProvider>)
}

describe('public employer and verification pages', () => {
  afterEach(() => vi.restoreAllMocks())

  it('loads employer context and daily logs from the token endpoints', async () => {
    vi.spyOn(publicApi, 'get').mockImplementation(async (url) => ({ data: url.includes('daily-logs') ? [{ logDate: '2026-07-01', content: 'İlk gün' }] : { valid: true, internshipId: 'i-1', studentName: 'Ayşe Yılmaz', companyName: 'KTÜN', startDate: '2026-07-01', endDate: '2026-07-30' } } as never))
    renderRoute(<EmployerEvaluationPage />, '/employer/evaluate/token-1')
    await waitFor(() => expect(screen.getByText(/Ayşe Yılmaz/)).toBeVisible())
    expect(screen.getByText('İlk gün')).toBeVisible()
  })

  it('renders a public verification result with digital approval stamp', async () => {
    vi.spyOn(publicApi, 'get').mockResolvedValue({ data: { internshipId: 'i-1', studentName: 'Ayşe Yılmaz', studentNumber: '123', companyName: 'KTÜN', status: 'COMPLETED', startDate: '2026-07-01', endDate: '2026-07-30', employerApprovalTimestamp: null, commissionApprovalTimestamp: null, employerLogsApprovedAt: '2026-08-01T10:00:00Z', isValid: true } } as never)
    renderRoute(<PublicVerificationPage />, '/verify/i-1')
    await waitFor(() => expect(screen.getByText('DOĞRULANDI')).toBeVisible())
    expect(screen.getByText(/dijital olarak imzalandı/)).toBeVisible()
  })
})

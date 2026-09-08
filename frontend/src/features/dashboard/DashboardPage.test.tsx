import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { queryClient } from '../../lib/query-client'
import { DashboardPage } from './DashboardPage'

describe('role dashboards', () => {
  it('shows a distinct institutional workspace heading for each role', () => {
    const { rerender } = render(<MemoryRouter><QueryClientProvider client={queryClient}><DashboardPage role="STUDENT" /></QueryClientProvider></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Öğrenci çalışma alanı' })).toBeVisible()
    rerender(<MemoryRouter><QueryClientProvider client={queryClient}><DashboardPage role="ADMIN" /></QueryClientProvider></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Yönetim çalışma alanı' })).toBeVisible()
  })
})

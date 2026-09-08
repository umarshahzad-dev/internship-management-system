import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { InternshipListPage } from './InternshipListPage'
import { AdminDepartmentProvider } from '../departments/department-context'

vi.mock('./internship.queries', () => ({
  useInternships: () => ({ data: [{ id: 'i-1', companyName: 'KTÜN Teknoloji', status: 'ONGOING', startDate: '2026-06-01', endDate: '2026-07-15' }], isLoading: false, isError: false, refetch: vi.fn() }),
  useCompanies: () => ({ data: [], isLoading: false, isError: false }),
}))

describe('internship list workflow', () => {
  it('renders scoped internships in a dense institutional table', () => {
    render(<MemoryRouter><QueryClientProvider client={new QueryClient()}><AdminDepartmentProvider><InternshipListPage role="STUDENT" /></AdminDepartmentProvider></QueryClientProvider></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Stajlarım' })).toBeVisible()
    expect(screen.getByText('KTÜN Teknoloji')).toBeVisible()
    expect(screen.getByText('Devam ediyor')).toBeVisible()
  })
})

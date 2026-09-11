import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminDepartmentProvider } from '../../departments/department-context'
import { DepartmentSelector } from './DepartmentSelector'

vi.mock('../../../lib/api', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: { items: [{ id: 'department-1', name: 'Bilgisayar Mühendisliği' }], total: 1, page: 1, pageSize: 20 } }) },
  unwrapPaginated: <T,>(payload: T[] | { items?: T[] }) => Array.isArray(payload) ? payload : payload.items ?? [],
}))

describe('DepartmentSelector', () => {
  it('renders department options from a paginated departments response', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={client}><AdminDepartmentProvider queryClient={client}><DepartmentSelector /></AdminDepartmentProvider></QueryClientProvider>)

    expect(await screen.findByRole('option', { name: 'Bilgisayar Mühendisliği' })).toBeInTheDocument()
  })
})

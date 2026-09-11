import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../../../components/ui'
import { CalendarHolidaysPage } from './CalendarHolidaysPage'

vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(async (url: string) => ({ data: url === '/calendars' ? { items: [{ id: 'term-1', termName: '2032 Güz', applicationStart: '2032-06-01', applicationEnd: '2032-06-30', internshipStart: '2032-07-01', internshipEnd: '2032-07-31' }], total: 1, page: 1, pageSize: 20 } : { items: [], total: 0, page: 1, pageSize: 20 } })),
    post: vi.fn(), patch: vi.fn(), delete: vi.fn(),
  },
  unwrapPaginatedResult: <T,>(payload: T[] | { items?: T[]; total?: number; page?: number; pageSize?: number }) => Array.isArray(payload) ? { items: payload, total: payload.length, page: 1, pageSize: 20 } : { items: payload.items ?? [], total: payload.total ?? 0, page: payload.page ?? 1, pageSize: payload.pageSize ?? 20 },
}))

vi.mock('../../departments/hooks/useDepartments', () => ({ useDepartments: () => ({ data: [] }) }))

describe('CalendarHolidaysPage', () => {
  it('prefills the term modal from the selected row', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<MemoryRouter initialEntries={['/calendar']}><QueryClientProvider client={client}><ToastProvider><CalendarHolidaysPage /></ToastProvider></QueryClientProvider></MemoryRouter>)

    await user.click(await screen.findByRole('button', { name: 'Düzenle' }))
    expect(screen.getByLabelText('Dönem adı')).toHaveValue('2032 Güz')
    expect(screen.getByLabelText('Başvuru başlangıcı')).toHaveValue('2032-06-01')
  })
})

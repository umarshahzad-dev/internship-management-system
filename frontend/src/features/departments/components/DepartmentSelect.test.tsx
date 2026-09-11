import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { describe, expect, it } from 'vitest'
import { DepartmentSelect } from './DepartmentSelect'

vi.mock('../hooks/useDepartments', () => ({
  useDepartments: () => ({ data: [{ id: 'd1', name: 'Bilgisayar Mühendisliği' }, { id: 'd2', name: 'Elektrik Elektronik Mühendisliği' }] }),
}))

function renderSelect(onChange = vi.fn()) {
  const client = new QueryClient()
  return { onChange, ...render(<QueryClientProvider client={client}><DepartmentSelect value="" onChange={onChange} /></QueryClientProvider>) }
}

describe('DepartmentSelect', () => {
  it('opens, filters, selects, and closes', () => {
    const { onChange } = renderSelect()
    fireEvent.click(screen.getByRole('button', { name: /bölüm/i }))
    expect(screen.getByRole('option', { name: 'Bilgisayar Mühendisliği' })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Bölüm ara' }), { target: { value: 'Elektrik' } })
    expect(screen.queryByRole('option', { name: 'Bilgisayar Mühendisliği' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('option', { name: 'Elektrik Elektronik Mühendisliği' }).querySelector('button') as HTMLElement)
    expect(onChange).toHaveBeenCalledWith('d2')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('supports keyboard selection and escape', () => {
    const { onChange } = renderSelect()
    const trigger = screen.getByRole('button', { name: /bölüm/i })
    fireEvent.click(trigger)
    const search = screen.getByRole('textbox', { name: 'Bölüm ara' })
    fireEvent.keyDown(search, { key: 'ArrowDown' })
    fireEvent.keyDown(search, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('d2')
    fireEvent.click(trigger)
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Bölüm ara' }), { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})

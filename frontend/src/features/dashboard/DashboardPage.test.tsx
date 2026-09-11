import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { queryClient } from '../../lib/query-client'
import { DashboardPage } from './DashboardPage'
import { AdminDashboardPage } from '../admin/pages/AdminDashboardPage'
import { AdminDepartmentProvider } from '../departments/department-context'

describe('role dashboards', () => {
  it('shows a distinct institutional workspace heading for each role', () => {
    const { rerender } = render(<MemoryRouter><QueryClientProvider client={queryClient}><AdminDepartmentProvider><DashboardPage role="STUDENT" /></AdminDepartmentProvider></QueryClientProvider></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Öğrenci çalışma alanı' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Staj işlemlerim' })).toHaveAttribute('href', '/staj-islemleri')
    rerender(<MemoryRouter><QueryClientProvider client={queryClient}><AdminDepartmentProvider><AdminDashboardPage /></AdminDepartmentProvider></QueryClientProvider></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Yönetim çalışma alanı' })).toBeVisible()
    expect(screen.queryByRole('link', { name: 'Stajlara git' })).not.toBeInTheDocument()
  })

  it('does not expose the SGK shortcut to Academic users', () => {
    render(<MemoryRouter><QueryClientProvider client={queryClient}><AdminDepartmentProvider><DashboardPage role="ACADEMIC" /></AdminDepartmentProvider></QueryClientProvider></MemoryRouter>)
    expect(screen.queryByRole('link', { name: 'SGK işlemleri' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Belge türlerini görüntüle' })).toBeVisible()
  })
})

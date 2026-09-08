import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AdminDepartmentProvider, useAdminDepartment } from './department-context'
import { queryClient } from '../../lib/query-client'

function Probe() {
  const { departmentId, setDepartmentId } = useAdminDepartment()
  return <div><span data-testid="department">{departmentId ?? 'none'}</span><button onClick={() => setDepartmentId('dept-b')}>Switch</button></div>
}

describe('AdminDepartmentProvider', () => {
  it('invalidates department-scoped queries when the active department changes', async () => {
    queryClient.clear()
    queryClient.setQueryData(['internships', 'dept-a'], ['old'])
    queryClient.setQueryData(['auth', 'me'], { id: 'u1' })

    render(<AdminDepartmentProvider initialDepartmentId="dept-a"><Probe /></AdminDepartmentProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Switch' }))

    await waitFor(() => expect(screen.getByTestId('department')).toHaveTextContent('dept-b'))
    expect(queryClient.getQueryState(['internships', 'dept-a'])?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(['auth', 'me'])?.isInvalidated).not.toBe(true)
  })
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { buildDocumentChecklist, canReviewApplicationDocument } from './InternshipDocumentsPage'
import { getSgkStatusOptions, resolveSgkRowStatus } from './SgkPage'
import { DraftEditForm } from '../internships/InternshipListPage'
import { employerEvaluationCriteria } from '../academic/components/EmployerEvaluationPanel'
import { adminCrudConfigs } from '../admin/pages/AdminCrudPages'
import { useTableUrlState } from '../shared/hooks/useTableUrlState'
import { canManageEmployerEvaluation } from '../internships/priority5'

function TableStateProbe() {
  const table = useTableUrlState()
  return <button type="button" onClick={() => table.update({ search: 'accepted', sort: 'status', pageSize: 25 })}>update {table.search} {table.sort} {table.pageSize}</button>
}

describe('Phase 5 workflow coverage', () => {
  it('allows document review only for pending documents and academic users', () => {
    expect(canReviewApplicationDocument('ACADEMIC', 'PENDING')).toBe(true)
    expect(canReviewApplicationDocument('ACADEMIC', 'ACCEPTED')).toBe(false)
    expect(canReviewApplicationDocument('ADMIN', 'PENDING')).toBe(false)
  })

  it('keeps SGK status options and row values independent', () => {
    expect(getSgkStatusOptions().map((option) => option.value)).toEqual(['PENDING', 'SUBMITTED', 'ACTIVE'])
    expect(resolveSgkRowStatus({ id: 'one', status: 'ACTIVE' }, { two: 'SUBMITTED' })).toBe('ACTIVE')
    expect(resolveSgkRowStatus({ id: 'two', status: 'PENDING' }, { two: 'SUBMITTED' })).toBe('SUBMITTED')
  })
  it('tracks required document status and latest version', () => {
    const checklist = buildDocumentChecklist([{ id: 'passport', name: 'Pasaport', isRequired: true, source: 'EXTERNAL_UPLOAD' }], [{ id: 'd1', documentTypeId: 'passport', status: 'REJECTED', versionNumber: 1 }, { id: 'd2', documentTypeId: 'passport', status: 'ACCEPTED', versionNumber: 2 }])
    expect(checklist[0]).toMatchObject({ status: 'ACCEPTED', versionNumber: 2 })
  })

  it('exposes all seven A-E employer evaluation criteria', () => {
    expect(employerEvaluationCriteria).toHaveLength(7)
    expect(employerEvaluationCriteria.map(([key]) => key)).toEqual(['attendance', 'effort', 'timeliness', 'conduct', 'teamwork', 'ethics', 'self_improvement'])
  })

  it('only exposes employer evaluation management at EVALUATION for academics', () => {
    expect(canManageEmployerEvaluation('ACADEMIC', 'EVALUATION')).toBe(true)
    expect(canManageEmployerEvaluation('ACADEMIC', 'GRADED')).toBe(false)
    expect(canManageEmployerEvaluation('ADMIN', 'EVALUATION')).toBe(false)
  })

  it('submits edited draft metadata from the student form', () => {
    const onSubmit = vi.fn()
    render(<MemoryRouter><DraftEditForm initial={{ companyId: 'old', startDate: '2026-01-01', endDate: '2026-01-10' }} onSubmit={onSubmit} /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Kurum ID'), { target: { value: 'new' } })
    screen.getByRole('button', { name: 'Taslağı kaydet' }).click()
    expect(onSubmit).toHaveBeenCalledWith({ companyId: 'new', startDate: '2026-01-01', endDate: '2026-01-10' })
  })

  it('keeps administrative CRUD domains and template endpoints explicit', () => {
    expect(Object.keys(adminCrudConfigs)).toEqual(['companies', 'document-types', 'calendars', 'holidays'])
    expect(adminCrudConfigs['document-types'].fields.some((field) => field.key === 'isRequired')).toBe(true)
  })

  it('persists document table search, sort, and page size in URL state', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><TableStateProbe /></MemoryRouter>)
    await user.click(screen.getByRole('button'))
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('update accepted status 25'))
  })
})

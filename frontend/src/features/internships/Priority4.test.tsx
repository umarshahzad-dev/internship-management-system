import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { PdfDownloadPage } from '../domain/PdfDownloadPage'
import { canAccessRoute } from '../../routes/route-permissions'
import { resolveStudentDocumentHref, studentOperationsDocuments } from './priority3'

vi.mock('../../lib/api', () => ({
  api: { get: vi.fn() },
}))

describe('Priority 4 document delivery', () => {
  it('only advertises document links backed by an API route', () => {
    expect(studentOperationsDocuments.find((document) => document.label === 'Zorunlu Staj Belgesi')?.endpoint)
      .toBe('/internships/documents/zorunlu-staj-belgesi')
    expect(studentOperationsDocuments.find((document) => document.label === 'Staj Başvuru Formu')?.endpoint)
      .toBe('/internships/:id/application-form')
    expect(studentOperationsDocuments.filter((document) => document.endpoint === null)).toHaveLength(4)
    expect(resolveStudentDocumentHref('/internships/:id/application-form', 'internship-1'))
      .toBe('/internships/internship-1/application-form')
    expect(resolveStudentDocumentHref('/internships/:id/application-form')).toBeUndefined()
  })

  it('keeps application-form PDF access limited to Student and Academic roles', () => {
    expect(canAccessRoute('applicationForm', 'STUDENT')).toBe(true)
    expect(canAccessRoute('applicationForm', 'ACADEMIC')).toBe(true)
    expect(canAccessRoute('applicationForm', 'ADMIN')).toBe(false)
    expect(canAccessRoute('applicationForm', 'ADMINISTRATIVE')).toBe(true)
    expect(canAccessRoute('mandatoryLetter', 'ACADEMIC')).toBe(true)
    expect(canAccessRoute('mandatoryLetter', 'ADMIN')).toBe(true)
  })

  it('renders an accessible PDF action with an explicit status region', () => {
    render(<MemoryRouter initialEntries={['/internships/internship-1/application-form']}><PdfDownloadPage title="Staj başvuru formu" endpoint="/internships/:id/application-form" filename="basvuru-formu.pdf" /></MemoryRouter>)
    expect(screen.getByRole('button', { name: 'Staj başvuru formu PDF indir' })).toBeEnabled()
    expect(screen.getByText('Belge, güncel staj verileriniz kullanılarak oluşturulur.')).toBeVisible()
  })
})

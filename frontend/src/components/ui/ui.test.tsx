import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { Button, Input, Modal, PageHeader, Table, Toast } from './index'

describe('Phase 2 UI primitives', () => {
  it('renders an explicit back link for detail pages', () => {
    render(<MemoryRouter><PageHeader title="Staj detayı" backHref="/internships" backLabel="Stajlara dön" /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Stajlara dön/ })).toHaveAttribute('href', '/internships')
  })
  it('renders institutional button variants and exposes a loading state', () => {
    render(
      <Button variant="danger" loading>
        Kaydet
      </Button>,
    )

    const button = screen.getByRole('button', { name: /kaydet/i })
    expect(button).toHaveClass('bg-red')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('associates inputs with labels and presents validation feedback', () => {
    render(<Input label="E-posta" name="email" error="Geçerli bir e-posta giriniz." />)

    const input = screen.getByRole('textbox', { name: 'E-posta' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'email-error')
    expect(screen.getByText('Geçerli bir e-posta giriniz.')).toBeVisible()
  })

  it('renders a dense, accessible data table and an empty state', () => {
    render(
      <Table
        caption="Staj başvuruları"
        columns={[
          { key: 'student', header: 'Öğrenci' },
          { key: 'status', header: 'Durum' },
        ]}
        data={[{ id: '1', student: 'Ayşe Yılmaz', status: 'Değerlendirmede' }]}
        rowKey={(row) => row.id}
      />,
    )

    expect(screen.getByRole('table', { name: 'Staj başvuruları' })).toBeVisible()
    expect(screen.getByRole('table').querySelector('thead')).toHaveClass('bg-navy')
    expect(screen.getByRole('cell', { name: 'Ayşe Yılmaz' })).toBeVisible()

    render(
      <Table
        caption="Boş liste"
        columns={[{ key: 'name', header: 'Ad' }]}
        data={[]}
        emptyMessage="Kayıt bulunamadı."
      />,
    )
    expect(screen.getByText('Kayıt bulunamadı.')).toBeVisible()
  })

  it('closes a modal with Escape and restores the close callback', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Modal open title="Başvuruyu incele" onClose={onClose}>
        İçerik
      </Modal>,
    )

    expect(screen.getByRole('dialog', { name: 'Başvuruyu incele' })).toBeVisible()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('announces success and error toast messages and supports dismissal', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()

    render(
      <>
        <Toast variant="success" title="Kaydedildi" message="Başvuru güncellendi." />
        <Toast variant="error" title="İşlem başarısız" onDismiss={onDismiss} />
      </>,
    )

    expect(screen.getByRole('status', { name: /kaydedildi/i })).toHaveTextContent('Başvuru güncellendi.')
    const errorToast = screen.getByRole('alert', { name: 'İşlem başarısız' })
    await user.click(screen.getByRole('button', { name: 'Bildirimi kapat' }))
    expect(errorToast).toBeVisible()
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

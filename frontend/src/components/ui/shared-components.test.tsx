import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  Badge,
  Checkbox,
  ConfirmDialog,
  DataToolbar,
  EmptyState,
  ErrorState,
  FileUpload,
  ForbiddenState,
  FormSection,
  IconButton,
  LoadingState,
  PageHeader,
  Pagination,
  Panel,
  PasswordInput,
  Select,
  Spinner,
  Tabs,
  Textarea,
  ToastProvider,
  Tooltip,
  useToast,
} from './index'

describe('complete Phase 2 shared component library', () => {
  it('supports icon buttons, password visibility, textarea, checkbox, and select fields', async () => {
    const user = userEvent.setup()
    render(
      <>
        <IconButton label="Sil" icon={<span aria-hidden="true">×</span>} />
        <PasswordInput label="Şifre" name="password" />
        <Textarea label="Açıklama" name="description" />
        <Checkbox label="Koşulları kabul ediyorum" name="terms" />
        <Select
          label="Durum"
          name="status"
          options={[{ value: 'draft', label: 'Taslak' }, { value: 'active', label: 'Aktif' }]}
        />
      </>,
    )

    expect(screen.getByRole('button', { name: 'Sil' })).toBeVisible()
    const password = screen.getByLabelText('Şifre')
    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Şifreyi göster' }))
    expect(password).toHaveAttribute('type', 'text')
    expect(screen.getByRole('textbox', { name: 'Açıklama' })).toBeVisible()
    expect(screen.getByRole('checkbox', { name: 'Koşulları kabul ediyorum' })).toBeVisible()
    expect(screen.getByRole('combobox', { name: 'Durum' })).toHaveValue('')
  })

  it('renders badges, tabs, pagination, and a spinner with accessible states', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()
    const onPageChange = vi.fn()
    render(
      <>
        <Badge variant="success">Onaylandı</Badge>
        <Tabs
          value="details"
          onValueChange={onTabChange}
          items={[{ id: 'details', label: 'Detay' }, { id: 'documents', label: 'Belgeler' }]}
        >
          Detay içeriği
        </Tabs>
        <Pagination page={2} totalPages={3} onPageChange={onPageChange} />
        <Spinner label="Yükleniyor" />
      </>,
    )

    expect(screen.getByText('Onaylandı')).toHaveClass('bg-emerald-100')
    expect(screen.getByRole('tab', { name: 'Detay' })).toHaveAttribute('aria-selected', 'true')
    await user.click(screen.getByRole('tab', { name: 'Belgeler' }))
    expect(onTabChange).toHaveBeenCalledWith('documents')
    await user.click(screen.getByRole('button', { name: 'Sonraki sayfa' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
    expect(screen.getByRole('status', { name: 'Yükleniyor' })).toBeVisible()
  })

  it('confirms destructive actions and reveals tooltip content', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const { unmount } = render(<ConfirmDialog open title="Başvuruyu sil" description="Bu işlem geri alınamaz." onConfirm={onConfirm} />)

    await user.click(screen.getByRole('button', { name: 'Onayla' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    unmount()
    render(
      <Tooltip content="Yardım" delayDuration={0}>
        <button type="button">Bilgi</button>
      </Tooltip>,
    )
    await user.hover(screen.getByRole('button', { name: 'Bilgi' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Yardım')
  })

  it('provides toast notifications through the shared provider', async () => {
    const user = userEvent.setup()
    function ToastTrigger() {
      const { addToast } = useToast()
      return <button onClick={() => addToast({ variant: 'success', title: 'Kaydedildi', message: 'Başvuru güncellendi.' })}>Bildirim göster</button>
    }

    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Bildirim göster' }))
    expect(await screen.findByRole('status', { name: 'Kaydedildi' })).toHaveTextContent('Başvuru güncellendi.')
    await user.click(screen.getByRole('button', { name: 'Bildirimi kapat' }))
    expect(screen.queryByRole('status', { name: 'Kaydedildi' })).not.toBeInTheDocument()
  })

  it('reports selected files from the accessible upload control', async () => {
    const user = userEvent.setup()
    const onFilesSelected = vi.fn()
    render(<FileUpload label="Staj belgesi" onFilesSelected={onFilesSelected} />)
    const file = new File(['pdf'], 'staj-belgesi.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('Staj belgesi'), file)
    expect(onFilesSelected).toHaveBeenCalledWith([file])
    expect(screen.getByText('staj-belgesi.pdf')).toBeVisible()
  })

  it('renders feedback states and institutional layout shells', () => {
    render(
      <>
        <ErrorState title="Yüklenemedi" message="Tekrar deneyiniz." />
        <EmptyState title="Kayıt yok" message="Yeni kayıt ekleyebilirsiniz." />
        <LoadingState label="Veriler yükleniyor" />
        <ForbiddenState />
        <PageHeader title="Staj başvuruları" description="Başvuruları yönetin." />
        <Panel title="Özet">Panel içeriği</Panel>
        <FormSection title="İletişim bilgileri">Form alanları</FormSection>
        <DataToolbar search={{ value: '', onChange: vi.fn(), label: 'Ara' }} filters={<span>Filtreler</span>} />
      </>,
    )

    expect(screen.getByRole('alert', { name: 'Yüklenemedi' })).toBeVisible()
    expect(screen.getByRole('status', { name: 'Kayıt yok' })).toBeVisible()
    expect(screen.getByRole('status', { name: 'Veriler yükleniyor' })).toBeVisible()
    expect(screen.getByRole('alert', { name: 'Erişim yetkiniz yok' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Staj başvuruları' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Özet' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'İletişim bilgileri' })).toBeVisible()
    expect(screen.getByRole('toolbar')).toBeVisible()
    expect(within(screen.getByRole('toolbar')).getByLabelText('Ara')).toBeVisible()
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../lib/api'
import { ForgotPasswordPage, ResetPasswordPage } from './PasswordResetPages'

describe('password reset pages', () => {
  afterEach(() => vi.restoreAllMocks())

  it('requests a reset link with the entered email', async () => {
    const user = userEvent.setup(); const request = vi.spyOn(api, 'post').mockResolvedValue({ data: {} } as never)
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>)
    await user.type(screen.getByLabelText('E-posta adresi'), 'student@ktun.edu.tr'); await user.click(screen.getByRole('button', { name: /yenileme bağlantısı gönder/i }))
    await waitFor(() => expect(request).toHaveBeenCalledWith('/auth/password-reset/request', { email: 'student@ktun.edu.tr' }))
  })

  it('confirms a new password using the URL token', async () => {
    const user = userEvent.setup(); const confirm = vi.spyOn(api, 'post').mockResolvedValue({ data: {} } as never)
    render(<MemoryRouter initialEntries={['/reset-password?token=reset-1']}><ResetPasswordPage /></MemoryRouter>)
    await user.type(screen.getByLabelText('Yeni şifre'), 'Secure-pass-1'); await user.type(screen.getByLabelText('Yeni şifre (tekrar)'), 'Secure-pass-1'); await user.click(screen.getByRole('button', { name: 'Şifreyi güncelle' }))
    await waitFor(() => expect(confirm).toHaveBeenCalledWith('/auth/password-reset/confirm', { token: 'reset-1', newPassword: 'Secure-pass-1' }))
  })
})

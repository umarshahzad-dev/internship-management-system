import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

const { login } = vi.hoisted(() => ({ login: vi.fn() }))

vi.mock('./auth.service', () => ({ login }))

describe('LoginPage', () => {
  beforeEach(() => {
    login.mockReset()
    window.history.pushState({}, '', '/login')
  })

  it('shows an inline error for invalid credentials without redirecting', async () => {
    login.mockRejectedValueOnce(new Error('Unauthorized'))
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('E-posta adresi'), { target: { value: 'student@ktun.edu.tr' } })
    fireEvent.change(screen.getByLabelText('Şifre'), { target: { value: 'incorrect-password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Giriş yap' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('E-posta adresi veya şifre hatalı')
    expect(window.location.pathname).toBe('/login')
  })
})

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { login } from './auth.service'
import type { UserProfile, LoginRequest } from './auth.types'
import { loginSchema } from './login.schema'
import ktunLogo from '../../assets/ktun-logo.png'

interface LoginPageProps { onAuthenticated?: (user: UserProfile) => void }

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function submit(credentials: LoginRequest) {
    setNotice('')
    try {
      const user = await login({ email: credentials.email.trim(), password: credentials.password })
      onAuthenticated?.(user)
      setNotice(`${user.firstName}, oturumunuz açıldı. Çalışma alanınız hazırlanıyor.`)
    } catch {
      setError('root.server', { message: 'E-posta adresi veya şifre hatalı. Bilgilerinizi kontrol edip tekrar deneyiniz.' })
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-gray-900">
      <div className="grid min-h-screen lg:grid-cols-[3fr_2fr]">
        <section className="relative hidden overflow-hidden bg-navy px-12 py-10 text-white lg:flex lg:flex-col">
          <div className="absolute inset-0 opacity-70" aria-hidden="true">
            <div className="absolute inset-x-0 top-24 border-y border-white/10" />
            <div className="absolute inset-y-0 left-1/4 border-l border-white/5" />
            <div className="absolute inset-y-0 left-2/4 border-l border-white/5" />
            <div className="absolute inset-y-0 left-3/4 border-l border-white/5" />
            <div className="absolute bottom-0 left-0 h-2 w-2/3 bg-red" />
          </div>
          <div className="relative flex items-start justify-between gap-8">
            <img className="h-16 w-16 object-contain" src={ktunLogo} alt="Konya Teknik Üniversitesi" />
            <span className="border-b-2 border-gold pb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold">IMAS</span>
          </div>
          <div className="relative my-auto max-w-2xl border-l-4 border-gold bg-slate-950/30 p-6 shadow-lg backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Sistem duyurusu</p>
            <h1 className="mt-3 text-xl font-bold leading-snug">Staj başvuru ve değerlendirme işlemleri bu çalışma alanından yürütülür.</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-200">Başvuru belgelerinizi yükleyin, günlük kayıtlarınızı tamamlayın ve süreç durumunuzu bölüm komisyonunuzla eş zamanlı takip edin.</p>
          </div>
          <div className="relative flex items-center justify-between border-t border-white/20 pt-5 text-xs text-slate-300">
            <span>Konya Teknik Üniversitesi</span><span>Internship Management System</span>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <img className="h-11 w-11 object-contain" src={ktunLogo} alt="Konya Teknik Üniversitesi" />
              <div className="text-xs leading-tight text-navy"><p className="font-bold uppercase">Konya Teknik Üniversitesi</p><p className="mt-1 text-gray-500">Staj Yönetim Sistemi</p></div>
            </div>
            <div className="mb-6 border-b-2 border-navy pb-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red">IMAS</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy">Oturum aç</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">Email adresiniz ve erişim şifreniz ile giriş yapabilirsiniz.</p>
            </div>
            <form className="space-y-5" noValidate onSubmit={handleSubmit(submit)}>
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="email">E-posta adresi</label>
                <input id="email" type="email" autoComplete="username" {...register('email')} onChange={(event) => { register('email').onChange(event); clearErrors('root.server') }} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 shadow-sm outline-none transition focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/30" />
                {errors.email ? <p className="mt-1 text-sm text-red" id="email-error">{errors.email.message}</p> : null}
              </div>
              <div>
                <div className="flex items-center justify-between gap-4"><label className="text-sm font-medium text-gray-700" htmlFor="password">Şifre</label><a className="text-sm font-medium text-navy underline-offset-4 hover:text-red hover:underline focus:outline-none focus:ring-2 focus:ring-navy" href="/forgot-password">Şifremi unuttum</a></div>
                <div className="relative mt-1">
                  <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" {...register('password')} onChange={(event) => { register('password').onChange(event); clearErrors('root.server') }} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} className="block w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 pr-20 text-base text-gray-900 outline-none transition focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/30" />
                  <button className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-navy hover:text-red focus:outline-none focus:ring-2 focus:ring-navy" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}>{showPassword ? 'Gizle' : 'Göster'}</button>
                </div>
                {errors.password ? <p className="mt-1 text-sm text-red" id="password-error">{errors.password.message}</p> : null}
              </div>
              {errors.root?.server ? <p className="border-l-4 border-red bg-red/5 px-4 py-3 text-sm leading-6 text-red" role="alert">{errors.root.server.message}</p> : null}
              {notice ? <p className="border-l-4 border-gold bg-gold/10 px-4 py-3 text-sm leading-6 text-navy" role="status">{notice}</p> : null}
              <button className="w-full rounded-md bg-red px-4 py-3 text-base font-bold text-white shadow-sm transition hover:bg-red/90 focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Oturum açılıyor…' : 'Giriş yap'}</button>
            </form>
            <p className="mt-10 border-t border-gray-200 pt-5 text-xs leading-5 text-gray-500">Bu sistem yalnızca yetkili kullanıcıların erişimi içindir. Giriş yaparak kurumun bilgi güvenliği kurallarını kabul etmiş olursunuz.</p>
          </div>
        </section>
      </div>
    </main>
  )
}

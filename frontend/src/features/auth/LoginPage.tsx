import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { login } from './auth.service'
import type { UserProfile, LoginRequest } from './auth.types'
import { loginSchema } from './login.schema'
import campusBg from '../../assets/campus-bg.jpg'
import ktunLogoHorizontal from '../../assets/ktun-logo-horizontal.png'
import ktunSeal from '../../assets/ktun-seal.png'

interface LoginPageProps {
  onAuthenticated?: (user: UserProfile) => void
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
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
      setError('root.server', {
        message: 'E-posta adresi veya şifre hatalı. Bilgilerinizi kontrol edip tekrar deneyiniz.',
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-gray-50 font-sans">
      {/* LEFT PANEL: 66% Width on Desktop */}
      <div className="hidden lg:flex lg:w-2/3 relative items-center justify-center overflow-hidden">
        {/* Campus Image Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${campusBg})` }}
        />
        {/* Heavy KTÜN Navy Overlay */}
        <div className="absolute inset-0 bg-[#0b213f]/85" />

        {/* Circular Seal (Top Left) */}
        <img
          src={ktunSeal}
          alt="KTUN Seal"
          className="absolute top-10 left-10 h-24 opacity-90 z-10 drop-shadow-lg"
        />

        {/* Institutional Text in a Modern Container */}
        <div className="relative z-10 p-10 bg-[#0b213f]/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full mx-12">
          {/* Badge */}
          <span className="inline-block px-3 py-1 mb-5 text-xs font-bold tracking-widest text-[#0b213f] bg-gray-100 rounded-full uppercase shadow-sm">
            Sistem Duyurusu
          </span>

          <h1 className="text-3xl font-semibold mb-5 leading-snug text-white">
            Staj başvuru ve değerlendirme işlemleri bu çalışma alanından yürütülür.
          </h1>

          <p className="text-lg text-white/80 leading-relaxed">
            Başvuru belgelerinizi yükleyin, günlük kayıtlarınızı tamamlayın ve süreç durumunuzu bölüm komisyonunuzla eş zamanlı takip edin.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: 33% Width on Desktop */}
      <div className="w-full lg:w-1/3 min-h-screen flex items-center justify-center p-8 lg:p-12 bg-white shadow-[-15px_0_30px_rgba(0,0,0,0.1)] z-20">
        <div className="w-full max-w-sm">
          {/* Horizontal Logo (Left Aligned) */}
          <div className="flex justify-start mb-12">
            <img
              src={ktunLogoHorizontal}
              alt="Konya Teknik Üniversitesi"
              className="h-16 object-contain"
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#0b213f] mb-2">Oturum aç</h2>
            <p className="text-gray-500 text-sm">Email adresiniz ve erişim şifreniz ile giriş yapabilirsiniz.</p>
          </div>

          {/* Form */}
          <form className="space-y-6" noValidate onSubmit={handleSubmit(submit)}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="email">
                E-posta adresi
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                {...register('email')}
                onChange={(event) => {
                  register('email').onChange(event)
                  clearErrors('root.server')
                }}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-[#0b213f] focus:ring-1 focus:ring-[#0b213f] outline-none"
              />
              {errors.email ? (
                <p className="mt-1 text-sm text-[#ba1c21]" id="email-error">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-gray-700" htmlFor="password">
                  Şifre
                </label>
                <a href="/forgot-password" className="text-sm text-[#0b213f] hover:underline font-medium">
                  Şifremi unuttum
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  onChange={(event) => {
                    register('password').onChange(event)
                    clearErrors('root.server')
                  }}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-[#0b213f] focus:ring-1 focus:ring-[#0b213f] outline-none pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  className="absolute right-4 top-3 text-sm text-[#0b213f] font-semibold"
                >
                  {showPassword ? 'Gizle' : 'Göster'}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1 text-sm text-[#ba1c21]" id="password-error">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {errors.root?.server ? (
              <p
                className="border-l-4 border-[#ba1c21] bg-red-50 px-4 py-3 text-sm leading-6 text-[#ba1c21] rounded-r-md"
                role="alert"
              >
                {errors.root.server.message}
              </p>
            ) : null}
            {notice ? (
              <p
                className="border-l-4 border-[#0b213f] bg-[#0b213f]/5 px-4 py-3 text-sm leading-6 text-[#0b213f] rounded-r-md"
                role="status"
              >
                {notice}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#ba1c21] hover:bg-[#9e171b] text-white font-bold py-3 rounded-md transition shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Oturum açılıyor…' : 'Giriş yap'}
            </button>
          </form>

          {/* Security Warning */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed text-left">
              Bu sistem yalnızca yetkili kullanıcıların erişimi içindir. Giriş yaparak kurumun bilgi güvenliği kurallarını kabul etmiş olursunuz.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(1, 'Şifrenizi giriniz.'),
})

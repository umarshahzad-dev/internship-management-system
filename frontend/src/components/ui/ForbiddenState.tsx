import { ShieldX } from 'lucide-react'
import { Button } from './Button'

export interface ForbiddenStateProps {
  title?: string
  message?: string
  onBack?: () => void
}

export function ForbiddenState({ title = 'Erişim yetkiniz yok', message = 'Bu sayfayı görüntülemek için gerekli yetkiye sahip değilsiniz.', onBack }: ForbiddenStateProps) {
  return (
    <div role="alert" aria-labelledby="forbidden-state-title" className="flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white px-6 py-10 text-center">
      <ShieldX aria-hidden="true" className="h-8 w-8 text-red" />
      <h2 id="forbidden-state-title" className="mt-3 text-lg font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {onBack ? <Button variant="outline" className="mt-4" onClick={onBack}>Geri dön</Button> : null}
    </div>
  )
}

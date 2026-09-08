import { Loader2 } from 'lucide-react'

export interface SpinnerProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }

export function Spinner({ label = 'Yükleniyor', size = 'md' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex items-center gap-2 text-sm text-gray-500">
      <Loader2 aria-hidden="true" className={`animate-spin text-navy ${sizeClasses[size]}`} />
      <span className="sr-only">{label}</span>
    </span>
  )
}

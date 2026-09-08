import { CheckCircle2, X, XCircle } from 'lucide-react'
import { useId, type ReactNode } from 'react'

type ToastVariant = 'success' | 'error'

export interface ToastProps {
  variant: ToastVariant
  title: string
  message?: ReactNode
  onDismiss?: () => void
}

export function Toast({ variant, title, message, onDismiss }: ToastProps) {
  const isError = variant === 'error'
  const titleId = useId()

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-labelledby={titleId}
      className={`flex w-full max-w-sm items-start gap-3 rounded-md px-4 py-3 text-sm text-white shadow-lg ${isError ? 'bg-red' : 'bg-emerald-600'}`}
    >
      {isError ? <XCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" /> : <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />}
      <div className="min-w-0 flex-1">
        <p id={titleId} className="font-semibold">
          {title}
        </p>
        {message ? <p className="mt-0.5 text-white/90">{message}</p> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Bildirimi kapat"
          className="rounded p-0.5 text-white/90 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}

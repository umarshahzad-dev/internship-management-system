import { AlertCircle } from 'lucide-react'
import { Button } from './Button'

export interface ErrorStateProps {
  title: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" aria-labelledby="error-state-title" className="flex flex-col items-center justify-center rounded-md border border-red/20 bg-red/5 px-6 py-10 text-center">
      <AlertCircle aria-hidden="true" className="h-8 w-8 text-red" />
      <h2 id="error-state-title" className="mt-3 text-lg font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {onRetry ? <Button variant="outline" className="mt-4" onClick={onRetry}>Tekrar dene</Button> : null}
    </div>
  )
}

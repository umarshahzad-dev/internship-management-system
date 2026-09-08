import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div role="status" aria-labelledby="empty-state-title" className="flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white px-6 py-10 text-center">
      <Inbox aria-hidden="true" className="h-8 w-8 text-gray-400" />
      <h2 id="empty-state-title" className="mt-3 text-lg font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

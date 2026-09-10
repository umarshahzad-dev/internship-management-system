import type { ReactNode } from 'react'

export interface PanelProps {
  title?: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ title, description, actions, children, className = '' }: PanelProps) {
  return (
    <section className={`rounded-md border border-gray-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      {title || description || actions ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-4">
          <div>
            {title ? <h2 className="text-lg font-bold text-gray-900">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

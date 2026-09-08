import type { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  description?: ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
  actions?: ReactNode
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 border-b border-gray-200 pb-4">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Sayfa yolu" className="mb-2 text-xs text-gray-500">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`}>
              {index > 0 ? <span className="mx-2 text-gray-300">/</span> : null}
              {crumb.href ? <a href={crumb.href} className="hover:text-navy hover:underline">{crumb.label}</a> : <span>{crumb.label}</span>}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-gray-900">{title}</h1>
          {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}

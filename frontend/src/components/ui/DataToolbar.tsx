import { Search } from 'lucide-react'
import type { ChangeEvent, ReactNode } from 'react'

export interface DataToolbarProps {
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    label?: string
  }
  filters?: ReactNode
  actions?: ReactNode
}

export function DataToolbar({ search, filters, actions }: DataToolbarProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => search?.onChange(event.target.value)

  return (
    <div role="toolbar" aria-label="Veri araçları" className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-gray-200 bg-white p-3">
      {search ? (
        <label className="relative min-w-56 flex-1">
          <span className="sr-only">{search.label ?? 'Ara'}</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search.value}
            onChange={handleSearchChange}
            placeholder={search.placeholder ?? 'Ara'}
            aria-label={search.label ?? 'Ara'}
            className="min-h-10 w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20"
          />
        </label>
      ) : null}
      {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
      {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}

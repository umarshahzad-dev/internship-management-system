import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className = '' }: PaginationProps) {
  const safeTotal = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(page, 1), safeTotal)

  return (
    <nav aria-label="Sayfalama" className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        aria-label="Önceki sayfa"
        disabled={safePage === 1}
        onClick={() => onPageChange(safePage - 1)}
        className="rounded-md p-2 text-navy transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-navy disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
      </button>
      {Array.from({ length: safeTotal }, (_, index) => index + 1).map((item) => (
        <button
          key={item}
          type="button"
          aria-label={`Sayfa ${item}`}
          aria-current={item === safePage ? 'page' : undefined}
          onClick={() => onPageChange(item)}
          className={`min-w-9 rounded-md px-2 py-1.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-navy ${item === safePage ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        aria-label="Sonraki sayfa"
        disabled={safePage === safeTotal}
        onClick={() => onPageChange(safePage + 1)}
        className="rounded-md p-2 text-navy transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-navy disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </button>
    </nav>
  )
}

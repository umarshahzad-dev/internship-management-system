import type { ReactNode } from 'react'

export interface TableColumn<T> {
  key: string
  header: ReactNode
  render?: (row: T, index: number) => ReactNode
  headerClassName?: string
  className?: string
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  caption?: string
  emptyMessage?: ReactNode
  rowKey?: (row: T, index: number) => string | number
}

export function Table<T>({
  columns,
  data,
  caption,
  emptyMessage = 'Gösterilecek kayıt bulunmuyor.',
  rowKey,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-gray-200 bg-white">
      <table className="w-full min-w-full border-collapse text-left text-sm text-gray-900" aria-label={caption}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="bg-navy text-xs uppercase tracking-wide text-white">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 font-semibold ${column.headerClassName ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={rowKey ? rowKey(row, index) : index}
                className={`border-t border-gray-200 transition-colors hover:bg-gray-100 ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}
              >
                {columns.map((column) => (
                  <td key={column.key} className={`whitespace-nowrap px-4 py-3 ${column.className ?? ''}`}>
                    {column.render ? column.render(row, index) : String((row as Record<string, unknown>)[column.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

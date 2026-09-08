import type { ReactNode } from 'react'

export interface TabItem {
  id: string
  label: string
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  value: string
  onValueChange: (value: string) => void
  children?: ReactNode
}

export function Tabs({ items, value, onValueChange, children }: TabsProps) {
  const panelId = `tabpanel-${value}`

  return (
    <div className="w-full">
      <div role="tablist" aria-label="Sekmeler" className="flex gap-4 border-b border-gray-200">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === value}
            aria-controls={panelId}
            disabled={item.disabled}
            onClick={() => onValueChange(item.id)}
            className={`border-b-2 px-1 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${item.id === value ? 'border-navy text-navy' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div id={panelId} role="tabpanel" tabIndex={0} className="pt-4 focus:outline-none focus:ring-2 focus:ring-navy">
        {children}
      </div>
    </div>
  )
}

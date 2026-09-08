import type { ReactNode } from 'react'

export interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return <div data-testid="public-layout" className="min-h-screen bg-gray-50">{children}</div>
}

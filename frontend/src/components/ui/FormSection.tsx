import type { ReactNode } from 'react'

export interface FormSectionProps {
  title: string
  description?: ReactNode
  children: ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="border-b border-gray-200 py-6 first:pt-0 last:border-b-0">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  )
}

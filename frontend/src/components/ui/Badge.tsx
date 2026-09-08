import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'

const badgeVariants = cva('inline-flex items-center rounded-full font-semibold', {
  variants: {
    variant: {
      neutral: 'bg-gray-100 text-gray-700',
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-emerald-100 text-emerald-800',
      warning: 'bg-amber-100 text-amber-900',
      danger: 'bg-red/10 text-red',
    },
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    },
  },
  defaultVariants: { variant: 'neutral', size: 'sm' },
})

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  children: ReactNode
}

export function Badge({ variant, size, className = '', children, ...props }: BadgeProps) {
  return <span {...props} className={badgeVariants({ variant, size, className })}>{children}</span>
}

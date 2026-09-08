import { createContext } from 'react'
import type { ToastProps } from './Toast'

export type ToastInput = Omit<ToastProps, 'onDismiss'>

export interface ToastContextValue {
  addToast: (toast: ToastInput) => number
  dismissToast: (id: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

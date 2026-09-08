import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Toast } from './Toast'
import { ToastContext, type ToastInput } from './toast-context'

interface ToastRecord extends ToastInput {
  id: number
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const addToast = useCallback((toast: ToastInput) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { ...toast, id }])
    return id
  }, [])
  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])
  const value = useMemo(() => ({ addToast, dismissToast }), [addToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div role="region" aria-label="Bildirimler" className="fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:w-96">
        {toasts.map((toast) => <Toast key={toast.id} {...toast} onDismiss={() => dismissToast(toast.id)} />)}
      </div>
    </ToastContext.Provider>
  )
}

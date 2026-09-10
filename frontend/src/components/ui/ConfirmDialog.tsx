import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './Button'
import type { ReactNode } from 'react'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel?: () => void
  confirmLabel?: string
  cancelLabel?: string
  confirmDisabled?: boolean
  confirmLoading?: boolean
  variant?: 'primary' | 'danger' | 'success' | 'outline' | 'secondary'
  loading?: boolean
  children?: ReactNode
}

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Onayla',
  cancelLabel = 'Vazgeç',
  confirmDisabled = false,
  confirmLoading = false,
  variant = 'danger',
  loading = false,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onCancel?.() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl focus:outline-none">
          <Dialog.Title className="text-xl font-bold leading-tight text-gray-900">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-500">{description}</Dialog.Description>
          {children ? <div className="mt-4">{children}</div> : null}
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="outline">{cancelLabel}</Button>
            </Dialog.Close>
            <Button variant={variant} loading={confirmLoading || loading} disabled={confirmDisabled} onClick={onConfirm}>{confirmLabel}</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

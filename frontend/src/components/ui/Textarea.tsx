import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: ReactNode
  helperText?: ReactNode
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, helperText, id, className = '', name, ...props },
  ref,
) {
  const generatedId = useId()
  const textareaId = id ?? name ?? generatedId
  const errorId = `${textareaId}-error`
  const helperId = `${textareaId}-help`

  return (
    <div className="w-full">
      <label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`mt-1 block min-h-24 w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20 ${error ? 'border-red focus:border-red focus:ring-red/20' : ''} ${className}`}
        {...props}
      />
      {error ? <p id={errorId} className="mt-1 text-sm text-red">{error}</p> : null}
      {!error && helperText ? <p id={helperId} className="mt-1 text-xs text-gray-500">{helperText}</p> : null}
    </div>
  )
})

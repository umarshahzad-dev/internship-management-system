import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: ReactNode
  helperText?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, id, className = '', name, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? name ?? generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-help`
  const describedBy = error ? errorId : helperText ? helperId : undefined

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        name={name}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        className={`mt-1 block min-h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20 ${error ? 'border-red focus:border-red focus:ring-red/20' : ''} ${className}`}
        {...props}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1 text-xs text-gray-500">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})

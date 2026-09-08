import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: ReactNode
  helperText?: ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, helperText, id, className = '', ...props },
  ref,
) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId
  const errorId = `${checkboxId}-error`
  const helperId = `${checkboxId}-help`

  return (
    <div className="w-full">
      <div className="flex items-start gap-2">
        <input
          {...props}
          ref={ref}
          id={checkboxId}
          type="checkbox"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`mt-0.5 h-4 w-4 rounded border-gray-300 text-navy accent-navy focus:ring-2 focus:ring-navy ${className}`}
        />
        <label htmlFor={checkboxId} className="text-sm text-gray-700">
          {label}
        </label>
      </div>
      {error ? <p id={errorId} className="mt-1 text-sm text-red">{error}</p> : null}
      {!error && helperText ? <p id={helperId} className="mt-1 text-xs text-gray-500">{helperText}</p> : null}
    </div>
  )
})

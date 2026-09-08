import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  placeholder?: string
  error?: ReactNode
  helperText?: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, placeholder = 'Seçiniz', error, helperText, id, className = '', name, value, defaultValue, ...props },
  ref,
) {
  const generatedId = useId()
  const selectId = id ?? name ?? generatedId
  const errorId = `${selectId}-error`
  const helperId = `${selectId}-help`

  return (
    <div className="w-full">
      <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        {...props}
        ref={ref}
        id={selectId}
        name={name}
        value={value}
        defaultValue={value === undefined ? defaultValue ?? '' : undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`mt-1 block min-h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20 ${error ? 'border-red focus:border-red focus:ring-red/20' : ''} ${className}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p id={errorId} className="mt-1 text-sm text-red">{error}</p> : null}
      {!error && helperText ? <p id={helperId} className="mt-1 text-xs text-gray-500">{helperText}</p> : null}
    </div>
  )
})

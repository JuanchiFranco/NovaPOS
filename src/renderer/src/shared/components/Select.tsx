import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', id, children, ...props }, ref) => {
    const selectId = id ?? props.name
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <select ref={ref} id={selectId} className={`input-base ${error ? 'input-error' : ''}`} {...props}>
          {children}
        </select>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    )
  }
)
Select.displayName = 'Select'

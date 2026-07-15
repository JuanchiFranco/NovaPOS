import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? props.name
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input-base ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
        {error ? (
          <span className="text-xs text-red-500">{error}</span>
        ) : hint ? (
          <span className="text-xs text-slate-400">{hint}</span>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'

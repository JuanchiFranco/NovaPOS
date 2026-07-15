import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const areaId = id ?? props.name
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {label && (
          <label htmlFor={areaId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          rows={3}
          className={`input-base resize-none ${error ? 'input-error' : ''}`}
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
TextArea.displayName = 'TextArea'

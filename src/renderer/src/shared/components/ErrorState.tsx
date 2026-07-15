import { AlertCircle } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Ocurrió un error',
  description,
  onRetry
}: ErrorStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="rounded-full bg-red-50 p-3 text-red-500 dark:bg-red-950/40 dark:text-red-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div>
        <p className="font-medium text-slate-700 dark:text-slate-200">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

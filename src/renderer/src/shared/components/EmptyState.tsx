import { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="rounded-full bg-slate-100 p-3 text-slate-400 dark:bg-slate-800">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <div>
        <p className="font-medium text-slate-700 dark:text-slate-200">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  )
}

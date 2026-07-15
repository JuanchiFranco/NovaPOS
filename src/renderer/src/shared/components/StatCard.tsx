import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
  hint?: string
  tone?: 'primary' | 'green' | 'amber' | 'red'
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300'
}

export function StatCard({ label, value, icon, hint, tone = 'primary' }: StatCardProps): JSX.Element {
  return (
    <div className="card flex items-start justify-between p-5">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
      <div className={`rounded-lg p-2.5 ${toneClasses[tone]}`}>{icon}</div>
    </div>
  )
}

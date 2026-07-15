import { ReactNode } from 'react'
import { Spinner } from './Spinner'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  header: string
  key: string
  render: (row: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string | number
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: ReactNode
}

export function Table<T>({
  columns,
  data,
  rowKey,
  loading,
  emptyTitle = 'Sin resultados',
  emptyDescription,
  emptyIcon
}: TableProps<T>): JSX.Element {
  if (loading) return <Spinner />
  if (data.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} />

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 font-medium ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.map((row) => (
            <tr key={rowKey(row)} className="transition hover:bg-slate-50 dark:hover:bg-slate-900/60">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-slate-700 dark:text-slate-300 ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
import { Loader2 } from 'lucide-react'

export function Spinner({ label = 'Cargando…' }: { label?: string }): JSX.Element {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

import { useState } from 'react'
import { User, X } from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'
import { useClientes } from '../../modules/clientes/hooks/useClientes'

interface ClienteAutocompleteProps {
  clienteId: number | null
  clienteNombre: string | null
  onChange: (id: number | null, nombre: string | null) => void
  placeholder?: string
}

export function ClienteAutocomplete({
  clienteId,
  clienteNombre,
  onChange,
  placeholder = 'Buscar cliente…'
}: ClienteAutocompleteProps): JSX.Element {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const debounced = useDebounce(search, 250)
  const { data } = useClientes({ search: debounced, page: 1, pageSize: 6 })

  if (clienteId) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-700 dark:text-slate-200">{clienteNombre}</span>
        </div>
        <button
          onClick={() => onChange(null, null)}
          className="rounded p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <input
        className="input-base"
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && search && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {(data?.data.length ?? 0) === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">Sin coincidencias</p>
          ) : (
            data?.data.map((c) => (
              <button
                key={c.id}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => {
                  onChange(c.id, c.nombre)
                  setSearch('')
                  setOpen(false)
                }}
              >
                <span className="font-medium">{c.nombre}</span>
                {c.telefono && <span className="ml-2 text-xs text-slate-400">{c.telefono}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

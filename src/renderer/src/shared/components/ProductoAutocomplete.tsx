import { useState } from 'react'
import { Package, X } from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'
import { useProductos } from '../../modules/productos/hooks/useProductos'

interface ProductoAutocompleteProps {
  productoId: number | null
  productoNombre: string | null
  onChange: (id: number | null, nombre: string | null, stock?: number) => void
  placeholder?: string
}

export function ProductoAutocomplete({
  productoId,
  productoNombre,
  onChange,
  placeholder = 'Buscar producto por nombre o código…'
}: ProductoAutocompleteProps): JSX.Element {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const debounced = useDebounce(search, 250)
  const { data } = useProductos({ search: debounced, page: 1, pageSize: 6 })

  if (productoId) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-700 dark:text-slate-200">{productoNombre}</span>
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
        <div
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
          onMouseDown={(e) => e.preventDefault()}
        >
          {(data?.data.length ?? 0) === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">Sin coincidencias</p>
          ) : (
            data?.data.map((p) => (
              <button
                key={p.id}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => {
                  onChange(p.id, p.nombre, p.stock)
                  setSearch('')
                  setOpen(false)
                }}
              >
                <span className="font-medium">{p.nombre}</span>
                <span className="ml-2 text-xs text-slate-400">
                  {p.codigo} · stock: {p.stock}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { PackageSearch, Plus } from 'lucide-react'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { useProductos } from '../../productos/hooks/useProductos'
import { useCartStore } from '../../../shared/store/cart.store'
import { formatCurrency } from '../../../shared/lib/format'
import toast from 'react-hot-toast'

export function ProductoBuscador(): JSX.Element {
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search, 250)
  const { data, isLoading } = useProductos({ search: debounced, page: 1, pageSize: 8 })
  const addProducto = useCartStore((s) => s.addProducto)

  return (
    <div>
      <div className="relative">
        <PackageSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input-base pl-9"
          placeholder="Buscar producto por nombre o código para agregar…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {search && (
        <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
          {isLoading ? (
            <p className="px-3 py-3 text-sm text-slate-400">Buscando…</p>
          ) : (data?.data.length ?? 0) === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-400">Sin resultados</p>
          ) : (
            data?.data.map((p) => (
              <button
                key={p.id}
                disabled={p.stock <= 0}
                onClick={() => {
                  if (p.stock <= 0) return
                  addProducto(p)
                  toast.success(`${p.nombre} agregado`)
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
              >
                <span>
                  <span className="font-medium">{p.nombre}</span>
                  <span className="ml-2 text-xs text-slate-400">{p.codigo} · stock {p.stock}</span>
                </span>
                <span className="flex items-center gap-2 font-medium text-primary-600 dark:text-primary-400">
                  {formatCurrency(p.precioVenta)}
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

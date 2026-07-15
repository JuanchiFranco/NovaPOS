import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '../../../shared/store/cart.store'
import { formatCurrency } from '../../../shared/lib/format'
import { EmptyState } from '../../../shared/components/EmptyState'

export function CarritoTable(): JSX.Element {
  const { items, incrementar, decrementar, setDescuento, removeItem } = useCartStore()

  if (items.length === 0) {
    return <EmptyState title="El carrito está vacío" description="Busca productos arriba para agregarlos a la venta." />
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th className="px-3 py-2 font-medium">Producto</th>
            <th className="px-3 py-2 font-medium">Precio</th>
            <th className="px-3 py-2 font-medium">Cantidad</th>
            <th className="px-3 py-2 font-medium">Descuento</th>
            <th className="px-3 py-2 text-right font-medium">Subtotal</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item) => {
            const subtotal = Math.max(0, item.precioUnitario * item.cantidad - item.descuento)
            return (
              <tr key={item.productoId}>
                <td className="px-3 py-2">
                  <p className="font-medium text-slate-700 dark:text-slate-200">{item.nombre}</p>
                  <p className="text-xs text-slate-400">{item.codigo}</p>
                </td>
                <td className="px-3 py-2">{formatCurrency(item.precioUnitario)}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => decrementar(item.productoId)}
                      className="rounded border border-slate-300 p-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => incrementar(item.productoId)}
                      disabled={item.cantidad >= item.stockDisponible}
                      className="rounded border border-slate-300 p-1 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={item.descuento}
                    onChange={(e) => setDescuento(item.productoId, Number(e.target.value))}
                    className="w-20 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">{formatCurrency(subtotal)}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => removeItem(item.productoId)}
                    className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

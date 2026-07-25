import { Store, Boxes } from 'lucide-react'
import { useCartStore, type TipoPrecio } from '../../../shared/store/cart.store'

const opciones: { value: TipoPrecio; label: string; icon: typeof Store }[] = [
  { value: 'DETAL', label: 'Al detal', icon: Store },
  { value: 'MAYORISTA', label: 'Al por mayor', icon: Boxes }
]

export function TipoPrecioSelector(): JSX.Element {
  const { tipoPrecio, setTipoPrecio } = useCartStore()

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de venta</label>
      <div className="grid grid-cols-2 gap-2">
        {opciones.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTipoPrecio(value)}
            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              tipoPrecio === value
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      {tipoPrecio === 'MAYORISTA' && (
        <p className="mt-1.5 text-xs text-slate-400">
          Se usará el precio al por mayor de cada producto (si no tiene uno definido, se usará el precio al detal).
        </p>
      )}
    </div>
  )
}

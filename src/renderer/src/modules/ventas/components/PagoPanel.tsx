import type { MetodoPago } from '@shared/types/dto'
import { CreditCard, Wallet, Banknote, Shuffle } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { formatCurrency } from '../../../shared/lib/format'
import type { TotalesVenta } from '../utils/calcularTotales'

interface PagoPanelProps {
  totales: TotalesVenta
  descuentoGlobal: number
  onDescuentoGlobalChange: (value: number) => void
  metodoPago: MetodoPago
  onMetodoPagoChange: (value: MetodoPago) => void
  montoEfectivo: number
  montoTarjeta: number
  montoTransferencia: number
  onMontoChange: (key: 'montoEfectivo' | 'montoTarjeta' | 'montoTransferencia', value: number) => void
  onConfirmar: () => void
  loading: boolean
  disabled: boolean
}

const metodos: { value: MetodoPago; label: string; icon: typeof Wallet }[] = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: Banknote },
  { value: 'TARJETA', label: 'Tarjeta', icon: CreditCard },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: Wallet },
  { value: 'MIXTO', label: 'Mixto', icon: Shuffle }
]

export function PagoPanel({
  totales,
  descuentoGlobal,
  onDescuentoGlobalChange,
  metodoPago,
  onMetodoPagoChange,
  montoEfectivo,
  montoTarjeta,
  montoTransferencia,
  onMontoChange,
  onConfirmar,
  loading,
  disabled
}: PagoPanelProps): JSX.Element {
  return (
    <div className="space-y-4">
      <Input
        label="Descuento global"
        type="number"
        min={0}
        value={descuentoGlobal}
        onChange={(e) => onDescuentoGlobalChange(Number(e.target.value))}
      />

      <div className="space-y-1.5 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal</span>
          <span>{formatCurrency(totales.subtotalBruto)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Descuento</span>
          <span>- {formatCurrency(totales.descuentoTotal)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
          <span>Total</span>
          <span>{formatCurrency(totales.total)}</span>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Método de pago</label>
        <div className="grid grid-cols-2 gap-2">
          {metodos.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onMetodoPagoChange(value)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                metodoPago === value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {metodoPago === 'MIXTO' && (
        <div className="grid grid-cols-1 gap-3">
          <Input
            label="Efectivo"
            type="number"
            min={0}
            value={montoEfectivo}
            onChange={(e) => onMontoChange('montoEfectivo', Number(e.target.value))}
          />
          <Input
            label="Tarjeta"
            type="number"
            min={0}
            value={montoTarjeta}
            onChange={(e) => onMontoChange('montoTarjeta', Number(e.target.value))}
          />
          <Input
            label="Transferencia"
            type="number"
            min={0}
            value={montoTransferencia}
            onChange={(e) => onMontoChange('montoTransferencia', Number(e.target.value))}
          />
        </div>
      )}

      <Button className="w-full" size="lg" loading={loading} disabled={disabled} onClick={onConfirmar}>
        Confirmar venta
      </Button>
    </div>
  )
}

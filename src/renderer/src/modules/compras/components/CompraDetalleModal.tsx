import type { FacturaCompraDTO } from '@shared/types/dto'
import { Modal } from '../../../shared/components/Modal'
import { formatCurrency, formatDateTime } from '../../../shared/lib/format'

const metodoPagoLabel: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia'
}

interface CompraDetalleModalProps {
  compra: FacturaCompraDTO | null
  onClose: () => void
}

export function CompraDetalleModal({ compra, onClose }: CompraDetalleModalProps): JSX.Element {
  return (
    <Modal open={Boolean(compra)} title={compra ? `Compra a ${compra.proveedorNombre}` : ''} onClose={onClose} size="lg">
      {compra && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Fecha</p>
              <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{formatDateTime(compra.fecha)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">N.º factura</p>
              <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{compra.numeroFactura ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Método de pago</p>
              <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                {compra.metodoPago ? metodoPagoLabel[compra.metodoPago] : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total</p>
              <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{formatCurrency(compra.total)}</p>
            </div>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="py-2">Descripción</th>
                <th className="py-2 text-right">Cant.</th>
                <th className="py-2 text-right">Valor unit.</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {compra.detalle.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2">{d.descripcion}</td>
                  <td className="py-2 text-right">{d.cantidad}</td>
                  <td className="py-2 text-right">{formatCurrency(d.valorUnitario)}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(d.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {compra.notas && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Notas</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{compra.notas}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

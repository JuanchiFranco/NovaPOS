import { useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle2, Download, Printer, ShoppingCart } from 'lucide-react'
import type { FacturaDTO, MetodoPago } from '@shared/types/dto'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Card } from '../../../shared/components/Card'
import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { useCartStore } from '../../../shared/store/cart.store'
import { calcularTotales } from '../utils/calcularTotales'
import { ClienteSelector } from '../components/ClienteSelector'
import { ProductoBuscador } from '../components/ProductoBuscador'
import { CarritoTable } from '../components/CarritoTable'
import { PagoPanel } from '../components/PagoPanel'
import { useCreateVenta } from '../hooks/useVentas'

export default function VentasPage(): JSX.Element {
  const cart = useCartStore()
  const createVenta = useCreateVenta()

  const [descuentoGlobal, setDescuentoGlobal] = useState(0)
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO')
  const [montoEfectivo, setMontoEfectivo] = useState(0)
  const [montoTarjeta, setMontoTarjeta] = useState(0)
  const [montoTransferencia, setMontoTransferencia] = useState(0)
  const [facturaEmitida, setFacturaEmitida] = useState<FacturaDTO | null>(null)

  const totales = calcularTotales(cart.items, descuentoGlobal)

  const montoHandlers = {
    montoEfectivo: setMontoEfectivo,
    montoTarjeta: setMontoTarjeta,
    montoTransferencia: setMontoTransferencia
  } as const

  const resetFormulario = (): void => {
    cart.clear()
    setDescuentoGlobal(0)
    setMetodoPago('EFECTIVO')
    setMontoEfectivo(0)
    setMontoTarjeta(0)
    setMontoTransferencia(0)
  }

  const handleConfirmar = (): void => {
    if (cart.items.length === 0) {
      toast.error('Agrega al menos un producto a la venta')
      return
    }

    createVenta.mutate(
      {
        clienteId: cart.clienteId,
        items: cart.items.map((i) => ({
          productoId: i.productoId,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuento: i.descuento
        })),
        descuentoGlobal,
        metodoPago,
        montoEfectivo: metodoPago === 'MIXTO' ? montoEfectivo : undefined,
        montoTarjeta: metodoPago === 'MIXTO' ? montoTarjeta : undefined,
        montoTransferencia: metodoPago === 'MIXTO' ? montoTransferencia : undefined
      },
      {
        onSuccess: async (venta) => {
          resetFormulario()
          try {
            const factura = await window.api.facturas.getByVentaId(venta.id)
            setFacturaEmitida(factura)
          } catch {
            // La venta se registró correctamente aunque no se pudo cargar la factura para el modal.
          }
        }
      }
    )
  }

  return (
    <div>
      <PageHeader title="Nueva venta" description="Registra una venta y genera la factura automáticamente." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h2 className="mb-3 font-medium text-slate-800 dark:text-slate-200">Cliente</h2>
            <ClienteSelector />
          </Card>

          <Card>
            <h2 className="mb-3 font-medium text-slate-800 dark:text-slate-200">Productos</h2>
            <ProductoBuscador />
            <div className="mt-4">
              <CarritoTable />
            </div>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-6">
          <h2 className="mb-3 flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
            <ShoppingCart className="h-4 w-4" /> Pago
          </h2>
          <PagoPanel
            totales={totales}
            descuentoGlobal={descuentoGlobal}
            onDescuentoGlobalChange={setDescuentoGlobal}
            metodoPago={metodoPago}
            onMetodoPagoChange={setMetodoPago}
            montoEfectivo={montoEfectivo}
            montoTarjeta={montoTarjeta}
            montoTransferencia={montoTransferencia}
            onMontoChange={(key, value) => montoHandlers[key](value)}
            onConfirmar={handleConfirmar}
            loading={createVenta.isPending}
            disabled={cart.items.length === 0}
          />
        </Card>
      </div>

      <Modal open={Boolean(facturaEmitida)} title="Venta registrada" onClose={() => setFacturaEmitida(null)} size="sm">
        {facturaEmitida && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <p className="text-sm text-slate-500">
              Se generó la factura <span className="font-semibold text-slate-800 dark:text-slate-200">{facturaEmitida.numero}</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  const path = await window.api.facturas.exportPdf(facturaEmitida.id)
                  if (path) toast.success('Factura exportada a PDF')
                }}
              >
                <Download className="h-4 w-4" /> Exportar PDF
              </Button>
              <Button variant="secondary" onClick={() => window.api.facturas.print(facturaEmitida.id)}>
                <Printer className="h-4 w-4" /> Imprimir
              </Button>
            </div>
            <Button className="w-full" onClick={() => setFacturaEmitida(null)}>
              Nueva venta
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}

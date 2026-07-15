import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Copy, Download, Eye, FileText, Printer } from 'lucide-react'
import type { FacturaDTO, MetodoPago } from '@shared/types/dto'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Card } from '../../../shared/components/Card'
import { Input } from '../../../shared/components/Input'
import { Select } from '../../../shared/components/Select'
import { Table, type Column } from '../../../shared/components/Table'
import { Pagination } from '../../../shared/components/Pagination'
import { Badge } from '../../../shared/components/Badge'
import { ClienteAutocomplete } from '../../../shared/components/ClienteAutocomplete'
import { formatCurrency, formatDateTime } from '../../../shared/lib/format'
import { useCartStore } from '../../../shared/store/cart.store'
import { useFacturas } from '../hooks/useFacturas'
import { FacturaDetalleModal } from '../components/FacturaDetalleModal'

const PAGE_SIZE = 10

export default function FacturasPage(): JSX.Element {
  const navigate = useNavigate()
  const cargarCarrito = useCartStore((s) => s.cargarCarrito)

  const [numero, setNumero] = useState('')
  const [productoNombre, setProductoNombre] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [metodoPago, setMetodoPago] = useState<MetodoPago | ''>('')
  const [clienteId, setClienteId] = useState<number | null>(null)
  const [clienteNombre, setClienteNombre] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [detalle, setDetalle] = useState<FacturaDTO | null>(null)
  const [duplicando, setDuplicando] = useState<number | null>(null)

  const params = useMemo(
    () => ({
      numero: numero || undefined,
      productoNombre: productoNombre || undefined,
      desde: desde || undefined,
      hasta: hasta || undefined,
      metodoPago: metodoPago || undefined,
      clienteId: clienteId ?? undefined,
      page,
      pageSize: PAGE_SIZE
    }),
    [numero, productoNombre, desde, hasta, metodoPago, clienteId, page]
  )

  const { data, isLoading } = useFacturas(params)

  const handleDuplicar = async (factura: FacturaDTO): Promise<void> => {
    setDuplicando(factura.id)
    try {
      const venta = await window.api.ventas.getById(factura.ventaId)
      const productos = await Promise.all(
        venta.detalle.map(async (d) => {
          try {
            return await window.api.productos.getById(d.productoId)
          } catch {
            return null
          }
        })
      )

      const items = venta.detalle
        .map((d, idx) => {
          const producto = productos[idx]
          if (!producto || !producto.activo || producto.stock <= 0) return null
          return {
            productoId: producto.id,
            nombre: producto.nombre,
            codigo: producto.codigo,
            precioUnitario: producto.precioVenta,
            cantidad: Math.min(d.cantidad, producto.stock),
            descuento: d.descuento,
            stockDisponible: producto.stock
          }
        })
        .filter((i): i is NonNullable<typeof i> => i !== null)

      if (items.length === 0) {
        toast.error('Ningún producto de esa venta está disponible actualmente')
        return
      }
      if (items.length < venta.detalle.length) {
        toast('Algunos productos ya no están disponibles y fueron omitidos', { icon: '⚠️' })
      }

      cargarCarrito(venta.clienteId, venta.clienteNombre, items)
      navigate('/ventas')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo duplicar la venta')
    } finally {
      setDuplicando(null)
    }
  }

  const columns: Column<FacturaDTO>[] = [
    { header: 'Número', key: 'numero', render: (f) => <span className="font-mono text-xs font-medium">{f.numero}</span> },
    { header: 'Fecha', key: 'fecha', render: (f) => formatDateTime(f.fechaEmision) },
    { header: 'Cliente', key: 'cliente', render: (f) => f.cliente?.nombre ?? 'Consumidor final' },
    { header: 'Método', key: 'metodo', render: (f) => f.metodoPago },
    { header: 'Total', key: 'total', render: (f) => <span className="font-medium">{formatCurrency(f.total)}</span> },
    {
      header: 'Estado',
      key: 'estado',
      render: (f) => (f.estado === 'EMITIDA' ? <Badge tone="green">Emitida</Badge> : <Badge tone="red">Anulada</Badge>)
    },
    {
      header: '',
      key: 'acciones',
      className: 'text-right',
      render: (f) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => setDetalle(f)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Ver">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => window.api.facturas.print(f.id)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Imprimir">
            <Printer className="h-4 w-4" />
          </button>
          <button
            onClick={async () => {
              const path = await window.api.facturas.exportPdf(f.id)
              if (path) toast.success('Factura exportada a PDF')
            }}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Exportar PDF"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDuplicar(f)}
            disabled={duplicando === f.id}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
            title="Duplicar venta"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader title="Historial de facturas" description="Consulta, filtra y reimprime tus facturas emitidas." />

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input label="Número" value={numero} onChange={(e) => { setNumero(e.target.value); setPage(1) }} />
          <Input
            label="Producto"
            value={productoNombre}
            onChange={(e) => { setProductoNombre(e.target.value); setPage(1) }}
          />
          <Input label="Desde" type="date" value={desde} onChange={(e) => { setDesde(e.target.value); setPage(1) }} />
          <Input label="Hasta" type="date" value={hasta} onChange={(e) => { setHasta(e.target.value); setPage(1) }} />
          <Select
            label="Método de pago"
            value={metodoPago}
            onChange={(e) => { setMetodoPago(e.target.value as MetodoPago | ''); setPage(1) }}
          >
            <option value="">Todos</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="MIXTO">Mixto</option>
          </Select>
        </div>
        <div className="mt-3 max-w-sm">
          <ClienteAutocomplete
            clienteId={clienteId}
            clienteNombre={clienteNombre}
            onChange={(id, nombre) => { setClienteId(id); setClienteNombre(nombre); setPage(1) }}
            placeholder="Filtrar por cliente…"
          />
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={data?.data ?? []}
          rowKey={(f) => f.id}
          loading={isLoading}
          emptyTitle="No hay facturas"
          emptyDescription="Las facturas aparecerán aquí cuando registres ventas."
          emptyIcon={<FileText className="h-6 w-6" />}
        />
        {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
      </Card>

      <FacturaDetalleModal factura={detalle} onClose={() => setDetalle(null)} />
    </div>
  )
}

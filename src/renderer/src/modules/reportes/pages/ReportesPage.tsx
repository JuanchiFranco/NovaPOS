import { useMemo, useState } from 'react'
import { BarChart3, Download, ShoppingBag, ShoppingCart } from 'lucide-react'
import type {
  MetodoPago,
  ReporteAgrupacion,
  ReporteComprasAgrupacion,
  ReporteComprasFilaDTO,
  ReporteFormato,
  ReporteVentasFilaDTO
} from '@shared/types/dto'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Card } from '../../../shared/components/Card'
import { Select } from '../../../shared/components/Select'
import { Input } from '../../../shared/components/Input'
import { Button } from '../../../shared/components/Button'
import { StatCard } from '../../../shared/components/StatCard'
import { Table, type Column } from '../../../shared/components/Table'
import { ClienteAutocomplete } from '../../../shared/components/ClienteAutocomplete'
import { ProductoAutocomplete } from '../../../shared/components/ProductoAutocomplete'
import { formatCurrency } from '../../../shared/lib/format'
import { useCategorias } from '../../productos/hooks/useProductos'
import {
  useExportarReporteCompras,
  useExportarReporteVentas,
  useReporteCompras,
  useReporteVentas
} from '../hooks/useReportes'

type Tab = 'ventas' | 'compras'

const agrupacionesVentas: { value: ReporteAgrupacion; label: string }[] = [
  { value: 'dia', label: 'Día' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'anio', label: 'Año' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'producto', label: 'Producto' },
  { value: 'categoria', label: 'Categoría' },
  { value: 'metodoPago', label: 'Método de pago' }
]

const agrupacionesCompras: { value: ReporteComprasAgrupacion; label: string }[] = [
  { value: 'dia', label: 'Día' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'anio', label: 'Año' },
  { value: 'proveedor', label: 'Proveedor' }
]

const formatos: { value: ReporteFormato; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'csv', label: 'CSV' }
]

export default function ReportesPage(): JSX.Element {
  const [tab, setTab] = useState<Tab>('ventas')

  return (
    <div>
      <PageHeader title="Reportes" description="Analiza tus ventas y compras por período, cliente, producto o método de pago." />

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab('ventas')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === 'ventas'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <ShoppingCart className="h-4 w-4" /> Ventas
        </button>
        <button
          onClick={() => setTab('compras')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === 'compras'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <ShoppingBag className="h-4 w-4" /> Compras
        </button>
      </div>

      {tab === 'ventas' ? <ReporteVentasPanel /> : <ReporteComprasPanel />}
    </div>
  )
}

function ReporteVentasPanel(): JSX.Element {
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [agrupacion, setAgrupacion] = useState<ReporteAgrupacion>('dia')
  const [clienteId, setClienteId] = useState<number | null>(null)
  const [clienteNombre, setClienteNombre] = useState<string | null>(null)
  const [productoId, setProductoId] = useState<number | null>(null)
  const [productoNombre, setProductoNombre] = useState<string | null>(null)
  const [categoriaId, setCategoriaId] = useState<number | ''>('')
  const [metodoPago, setMetodoPago] = useState<MetodoPago | ''>('')
  const [formato, setFormato] = useState<ReporteFormato>('pdf')

  const { data: categorias = [] } = useCategorias()

  const params = useMemo(
    () => ({
      desde: desde || undefined,
      hasta: hasta || undefined,
      agrupacion,
      clienteId: clienteId ?? undefined,
      productoId: productoId ?? undefined,
      categoriaId: categoriaId === '' ? undefined : categoriaId,
      metodoPago: metodoPago || undefined
    }),
    [desde, hasta, agrupacion, clienteId, productoId, categoriaId, metodoPago]
  )

  const { data, isLoading } = useReporteVentas(params)
  const exportMutation = useExportarReporteVentas()

  const columns: Column<ReporteVentasFilaDTO>[] = [
    { header: 'Grupo', key: 'etiqueta', render: (f) => <span className="font-medium">{f.etiqueta}</span> },
    { header: 'N.º ventas', key: 'cantidadVentas', render: (f) => f.cantidadVentas },
    { header: 'Unidades', key: 'unidadesVendidas', render: (f) => f.unidadesVendidas },
    { header: 'Subtotal', key: 'subtotal', render: (f) => formatCurrency(f.subtotal) },
    { header: 'Descuento', key: 'descuento', render: (f) => formatCurrency(f.descuento) },
    { header: 'Total', key: 'total', render: (f) => <span className="font-semibold">{formatCurrency(f.total)}</span> }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <Input label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          <Select label="Agrupar por" value={agrupacion} onChange={(e) => setAgrupacion(e.target.value as ReporteAgrupacion)}>
            {agrupacionesVentas.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
          <Select label="Método de pago" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as MetodoPago | '')}>
            <option value="">Todos</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="MIXTO">Mixto</option>
          </Select>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cliente</label>
            <ClienteAutocomplete
              clienteId={clienteId}
              clienteNombre={clienteNombre}
              onChange={(id, nombre) => {
                setClienteId(id)
                setClienteNombre(nombre)
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Producto</label>
            <ProductoAutocomplete
              productoId={productoId}
              productoNombre={productoNombre}
              onChange={(id, nombre) => {
                setProductoId(id)
                setProductoNombre(nombre)
              }}
            />
          </div>
          <Select
            label="Categoría"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
          <div className="flex items-end gap-2">
            <Select label="Formato" value={formato} onChange={(e) => setFormato(e.target.value as ReporteFormato)} className="flex-1">
              {formatos.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
            <Button
              loading={exportMutation.isPending}
              onClick={() => exportMutation.mutate({ params, formato })}
              className="h-10"
            >
              <Download className="h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>
      </Card>

      {data && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Ventas" value={String(data.totales.cantidadVentas)} icon={<ShoppingCart className="h-5 w-5" />} />
          <StatCard label="Unidades vendidas" value={String(data.totales.unidadesVendidas)} icon={<BarChart3 className="h-5 w-5" />} tone="green" />
          <StatCard label="Descuentos" value={formatCurrency(data.totales.descuento)} icon={<BarChart3 className="h-5 w-5" />} tone="amber" />
          <StatCard label="Total vendido" value={formatCurrency(data.totales.total)} icon={<BarChart3 className="h-5 w-5" />} tone="primary" />
        </div>
      )}

      <Card>
        <Table
          columns={columns}
          data={data?.filas ?? []}
          rowKey={(f) => f.clave}
          loading={isLoading}
          emptyTitle="Sin datos para los filtros seleccionados"
          emptyIcon={<BarChart3 className="h-6 w-6" />}
        />
      </Card>
    </div>
  )
}

function ReporteComprasPanel(): JSX.Element {
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [agrupacion, setAgrupacion] = useState<ReporteComprasAgrupacion>('dia')
  const [proveedorNombre, setProveedorNombre] = useState('')
  const [formato, setFormato] = useState<ReporteFormato>('pdf')

  const params = useMemo(
    () => ({ desde: desde || undefined, hasta: hasta || undefined, agrupacion, proveedorNombre: proveedorNombre || undefined }),
    [desde, hasta, agrupacion, proveedorNombre]
  )

  const { data, isLoading } = useReporteCompras(params)
  const exportMutation = useExportarReporteCompras()

  const columns: Column<ReporteComprasFilaDTO>[] = [
    { header: 'Grupo', key: 'etiqueta', render: (f) => <span className="font-medium">{f.etiqueta}</span> },
    { header: 'N.º compras', key: 'cantidadCompras', render: (f) => f.cantidadCompras },
    { header: 'Total', key: 'total', render: (f) => <span className="font-semibold">{formatCurrency(f.total)}</span> }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <Input label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          <Select
            label="Agrupar por"
            value={agrupacion}
            onChange={(e) => setAgrupacion(e.target.value as ReporteComprasAgrupacion)}
          >
            {agrupacionesCompras.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
          <Input label="Proveedor" placeholder="Buscar por nombre…" value={proveedorNombre} onChange={(e) => setProveedorNombre(e.target.value)} />
          <div className="flex items-end gap-2">
            <Select label="Formato" value={formato} onChange={(e) => setFormato(e.target.value as ReporteFormato)} className="flex-1">
              {formatos.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
            <Button
              loading={exportMutation.isPending}
              onClick={() => exportMutation.mutate({ params, formato })}
              className="h-10"
            >
              <Download className="h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>
      </Card>

      {data && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
          <StatCard label="Compras" value={String(data.totales.cantidadCompras)} icon={<ShoppingBag className="h-5 w-5" />} />
          <StatCard label="Total comprado" value={formatCurrency(data.totales.total)} icon={<BarChart3 className="h-5 w-5" />} tone="primary" />
        </div>
      )}

      <Card>
        <Table
          columns={columns}
          data={data?.filas ?? []}
          rowKey={(f) => f.clave}
          loading={isLoading}
          emptyTitle="Sin datos para los filtros seleccionados"
          emptyIcon={<BarChart3 className="h-6 w-6" />}
        />
      </Card>
    </div>
  )
}

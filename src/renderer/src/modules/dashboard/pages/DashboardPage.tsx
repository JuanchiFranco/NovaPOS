import { AlertTriangle, DollarSign, Receipt, ShoppingBag } from 'lucide-react'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Card } from '../../../shared/components/Card'
import { StatCard } from '../../../shared/components/StatCard'
import { Spinner } from '../../../shared/components/Spinner'
import { Badge } from '../../../shared/components/Badge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { formatCurrency, formatDateTime } from '../../../shared/lib/format'
import { useDashboard } from '../hooks/useDashboard'
import { VentasChart } from '../components/VentasChart'
import { ProductosMasVendidos } from '../components/ProductosMasVendidos'

export default function DashboardPage(): JSX.Element {
  const { data, isLoading, isError, error, refetch } = useDashboard()

  if (isLoading) return <Spinner />
  if (isError || !data) {
    return (
      <ErrorState
        title="No se pudo cargar el dashboard"
        description={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div>
      <PageHeader title="Dashboard" description="Resumen general del negocio en tiempo real." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ventas de hoy"
          value={formatCurrency(data.ventasHoy.total)}
          hint={`${data.ventasHoy.cantidad} venta(s)`}
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatCard
          label="Ventas del mes"
          value={formatCurrency(data.ventasMes.total)}
          hint={`${data.ventasMes.cantidad} venta(s)`}
          icon={<Receipt className="h-5 w-5" />}
          tone="green"
        />
        <StatCard
          label="Total facturado"
          value={formatCurrency(data.totalFacturado)}
          hint="Histórico"
          icon={<DollarSign className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Productos con bajo stock"
          value={String(data.productosBajoStock.length)}
          hint="Requieren reposición"
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="mb-4 font-medium text-slate-800 dark:text-slate-200">Ventas últimos 14 días</h2>
          <VentasChart data={data.ventasPorDia} />
        </Card>

        <Card>
          <h2 className="mb-4 font-medium text-slate-800 dark:text-slate-200">Productos más vendidos</h2>
          <ProductosMasVendidos data={data.productosMasVendidos} />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="mb-4 font-medium text-slate-800 dark:text-slate-200">Últimas ventas</h2>
          {data.ultimasVentas.length === 0 ? (
            <EmptyState title="Sin ventas todavía" description="Registra tu primera venta desde el módulo Ventas." />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.ultimasVentas.map((venta) => (
                <div key={venta.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {venta.clienteNombre ?? 'Consumidor final'}
                    </p>
                    <p className="text-xs text-slate-400">{formatDateTime(venta.createdAt)} · {venta.facturaNumero}</p>
                  </div>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(venta.total)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-medium text-slate-800 dark:text-slate-200">Alertas de stock bajo</h2>
          {data.productosBajoStock.length === 0 ? (
            <EmptyState title="Todo en orden" description="No hay productos por debajo del stock mínimo." />
          ) : (
            <div className="space-y-3">
              {data.productosBajoStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{p.nombre}</p>
                    <p className="text-xs text-slate-400">{p.codigo}</p>
                  </div>
                  <Badge tone="red">{p.stock} / mín. {p.stockMinimo}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

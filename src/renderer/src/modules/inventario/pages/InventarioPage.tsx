import { AlertTriangle, Boxes } from 'lucide-react'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Card } from '../../../shared/components/Card'
import { Table, type Column } from '../../../shared/components/Table'
import { Badge } from '../../../shared/components/Badge'
import type { ProductoDTO } from '@shared/types/dto'
import { useProductosBajoStock } from '../../productos/hooks/useProductos'

/**
 * El stock se actualiza automáticamente con cada venta (ver módulo Ventas).
 * La vista completa de entradas/salidas/movimientos y ajustes manuales
 * llega en la siguiente fase del proyecto.
 */
export default function InventarioPage(): JSX.Element {
  const { data: productos = [], isLoading } = useProductosBajoStock()

  const columns: Column<ProductoDTO>[] = [
    { header: 'Código', key: 'codigo', render: (p) => <span className="font-mono text-xs">{p.codigo}</span> },
    { header: 'Producto', key: 'nombre', render: (p) => p.nombre },
    { header: 'Stock actual', key: 'stock', render: (p) => p.stock },
    { header: 'Stock mínimo', key: 'stockMinimo', render: (p) => p.stockMinimo },
    { header: '', key: 'estado', render: () => <Badge tone="red">Reponer</Badge> }
  ]

  return (
    <div>
      <PageHeader title="Inventario" description="El stock se actualiza automáticamente con cada venta." />

      <Card className="mb-6 flex items-start gap-3 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <Boxes className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          El historial detallado de entradas, salidas y ajustes manuales de inventario estará disponible en la
          siguiente fase. Por ahora, aquí puedes ver los productos que requieren reposición.
        </p>
      </Card>

      <Card>
        <h2 className="mb-4 flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
          <AlertTriangle className="h-4 w-4 text-red-500" /> Productos con stock bajo
        </h2>
        <Table
          columns={columns}
          data={productos}
          rowKey={(p) => p.id}
          loading={isLoading}
          emptyTitle="Sin alertas de stock"
          emptyDescription="Todos los productos están por encima de su stock mínimo."
        />
      </Card>
    </div>
  )
}

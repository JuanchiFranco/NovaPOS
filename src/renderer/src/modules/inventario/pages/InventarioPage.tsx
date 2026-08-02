import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, Boxes, Plus, Settings2 } from 'lucide-react'
import type { MovimientoInventarioDTO, TipoMovimiento } from '@shared/types/dto'
import type { MovimientoInventarioFormValues } from '@shared/schemas/inventario.schema'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Card } from '../../../shared/components/Card'
import { Button } from '../../../shared/components/Button'
import { Select } from '../../../shared/components/Select'
import { Badge } from '../../../shared/components/Badge'
import { Table, type Column } from '../../../shared/components/Table'
import { Pagination } from '../../../shared/components/Pagination'
import { Modal } from '../../../shared/components/Modal'
import { formatDateTime } from '../../../shared/lib/format'
import { useProductosBajoStock } from '../../productos/hooks/useProductos'
import { useMovimientosInventario, useRegistrarMovimiento } from '../hooks/useInventario'
import { MovimientoForm } from '../components/MovimientoForm'

const PAGE_SIZE = 10

const tipoTone: Record<TipoMovimiento, 'green' | 'red' | 'amber'> = {
  ENTRADA: 'green',
  SALIDA: 'red',
  AJUSTE: 'amber'
}

const tipoLabel: Record<TipoMovimiento, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  AJUSTE: 'Ajuste'
}

const tipoIcon: Record<TipoMovimiento, JSX.Element> = {
  ENTRADA: <ArrowUpCircle className="mr-1 inline h-3 w-3" />,
  SALIDA: <ArrowDownCircle className="mr-1 inline h-3 w-3" />,
  AJUSTE: <Settings2 className="mr-1 inline h-3 w-3" />
}

export default function InventarioPage(): JSX.Element {
  const [tipo, setTipo] = useState<TipoMovimiento | ''>('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: productosBajoStock = [] } = useProductosBajoStock()

  const params = useMemo(
    () => ({ tipo: tipo || undefined, page, pageSize: PAGE_SIZE }),
    [tipo, page]
  )
  const { data, isLoading } = useMovimientosInventario(params)
  const registrarMutation = useRegistrarMovimiento()

  const handleSubmit = (values: MovimientoInventarioFormValues): void => {
    registrarMutation.mutate(values, { onSuccess: () => setModalOpen(false) })
  }

  const columns: Column<MovimientoInventarioDTO>[] = [
    { header: 'Fecha', key: 'fecha', render: (m) => formatDateTime(m.createdAt) },
    {
      header: 'Producto',
      key: 'producto',
      render: (m) => (
        <div>
          <p className="font-medium">{m.productoNombre}</p>
          <p className="font-mono text-xs text-slate-400">{m.productoCodigo}</p>
        </div>
      )
    },
    {
      header: 'Tipo',
      key: 'tipo',
      render: (m) => (
        <Badge tone={tipoTone[m.tipo]}>
          {tipoIcon[m.tipo]}
          {tipoLabel[m.tipo]}
        </Badge>
      )
    },
    { header: 'Cantidad', key: 'cantidad', render: (m) => m.cantidad },
    {
      header: 'Stock',
      key: 'stock',
      render: (m) => (
        <span className="text-xs text-slate-500">
          {m.stockAnterior} → <span className="font-medium text-slate-800 dark:text-slate-200">{m.stockNuevo}</span>
        </span>
      )
    },
    { header: 'Motivo', key: 'motivo', render: (m) => m.motivo ?? '—' }
  ]

  return (
    <div>
      <PageHeader
        title="Inventario"
        description="Historial de movimientos de stock: entradas, salidas y ajustes manuales."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Registrar movimiento
          </Button>
        }
      />

      {productosBajoStock.length > 0 && (
        <Card className="mb-6 flex items-start gap-3 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="text-sm text-amber-700 dark:text-amber-300">
            <p className="font-medium">{productosBajoStock.length} producto(s) con stock bajo el mínimo.</p>
            <p className="mt-0.5">
              {productosBajoStock
                .slice(0, 5)
                .map((p) => p.nombre)
                .join(', ')}
              {productosBajoStock.length > 5 ? '…' : ''}
            </p>
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value as TipoMovimiento | '')
              setPage(1)
            }}
            className="max-w-xs"
          >
            <option value="">Todos los tipos</option>
            <option value="ENTRADA">Entradas</option>
            <option value="SALIDA">Salidas</option>
            <option value="AJUSTE">Ajustes</option>
          </Select>
        </div>

        <Table
          columns={columns}
          data={data?.data ?? []}
          rowKey={(m) => m.id}
          loading={isLoading}
          emptyTitle="Sin movimientos registrados"
          emptyDescription="Los movimientos por ventas y los que registres manualmente aparecerán aquí."
          emptyIcon={<Boxes className="h-6 w-6" />}
        />

        {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
      </Card>

      <Modal open={modalOpen} title="Registrar movimiento de inventario" onClose={() => setModalOpen(false)} size="md">
        <MovimientoForm loading={registrarMutation.isPending} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}

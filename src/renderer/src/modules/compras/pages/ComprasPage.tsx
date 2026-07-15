import { useMemo, useState } from 'react'
import { Eye, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import type { FacturaCompraDTO } from '@shared/types/dto'
import type { FacturaCompraFormValues } from '@shared/schemas/facturaCompra.schema'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Card } from '../../../shared/components/Card'
import { Input } from '../../../shared/components/Input'
import { Button } from '../../../shared/components/Button'
import { Table, type Column } from '../../../shared/components/Table'
import { Pagination } from '../../../shared/components/Pagination'
import { Modal } from '../../../shared/components/Modal'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { formatCurrency, formatDateTime } from '../../../shared/lib/format'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { useCompras, useCreateCompra, useRemoveCompra } from '../hooks/useCompras'
import { CompraForm } from '../components/CompraForm'
import { CompraDetalleModal } from '../components/CompraDetalleModal'

const PAGE_SIZE = 10

const metodoPagoLabel: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia'
}

export default function ComprasPage(): JSX.Element {
  const [proveedorNombre, setProveedorNombre] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebounce(proveedorNombre, 300)

  const [modalOpen, setModalOpen] = useState(false)
  const [detalle, setDetalle] = useState<FacturaCompraDTO | null>(null)
  const [toDelete, setToDelete] = useState<FacturaCompraDTO | null>(null)

  const params = useMemo(
    () => ({ proveedorNombre: debounced || undefined, page, pageSize: PAGE_SIZE }),
    [debounced, page]
  )
  const { data, isLoading } = useCompras(params)
  const createMutation = useCreateCompra()
  const removeMutation = useRemoveCompra()

  const handleSubmit = (values: FacturaCompraFormValues): void => {
    createMutation.mutate(values, { onSuccess: () => setModalOpen(false) })
  }

  const columns: Column<FacturaCompraDTO>[] = [
    {
      header: 'Proveedor',
      key: 'proveedor',
      render: (c) => <span className="font-medium">{c.proveedorNombre}</span>
    },
    { header: 'N.º factura', key: 'numeroFactura', render: (c) => c.numeroFactura ?? '—' },
    { header: 'Fecha', key: 'fecha', render: (c) => formatDateTime(c.fecha) },
    {
      header: 'Método',
      key: 'metodoPago',
      render: (c) => (c.metodoPago ? metodoPagoLabel[c.metodoPago] : '—')
    },
    { header: 'Total', key: 'total', render: (c) => <span className="font-medium">{formatCurrency(c.total)}</span> },
    {
      header: '',
      key: 'acciones',
      className: 'text-right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setDetalle(c)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Ver detalle"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => setToDelete(c)}
            className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Compras a proveedores"
        description="Registra las facturas de compra recibidas de tus proveedores."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Registrar compra
          </Button>
        }
      />

      <Card>
        <Input
          placeholder="Buscar por proveedor…"
          value={proveedorNombre}
          onChange={(e) => {
            setProveedorNombre(e.target.value)
            setPage(1)
          }}
          className="mb-4 max-w-md"
        />

        <Table
          columns={columns}
          data={data?.data ?? []}
          rowKey={(c) => c.id}
          loading={isLoading}
          emptyTitle="No hay compras registradas"
          emptyDescription="Registra tu primera factura de compra a un proveedor."
          emptyIcon={<ShoppingBag className="h-6 w-6" />}
        />

        {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
      </Card>

      <Modal open={modalOpen} title="Registrar compra" onClose={() => setModalOpen(false)} size="lg">
        <CompraForm loading={createMutation.isPending} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>

      <CompraDetalleModal compra={detalle} onClose={() => setDetalle(null)} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar compra"
        message={`¿Seguro que deseas eliminar la compra a "${toDelete?.proveedorNombre}"? Esta acción no se puede deshacer.`}
        danger
        loading={removeMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) removeMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
        }}
      />
    </div>
  )
}

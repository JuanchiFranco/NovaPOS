import { useMemo, useState } from 'react'
import { AlertTriangle, Package, Pencil, Plus, Trash2 } from 'lucide-react'
import type { ProductoDTO } from '@shared/types/dto'
import type { ProductoFormValues } from '@shared/schemas/producto.schema'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Card } from '../../../shared/components/Card'
import { SearchInput } from '../../../shared/components/SearchInput'
import { Button } from '../../../shared/components/Button'
import { Table, type Column } from '../../../shared/components/Table'
import { Pagination } from '../../../shared/components/Pagination'
import { Modal } from '../../../shared/components/Modal'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { Badge } from '../../../shared/components/Badge'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { formatCurrency } from '../../../shared/lib/format'
import {
  useCategorias,
  useCreateProducto,
  useProductos,
  useRemoveProducto,
  useUpdateProducto
} from '../hooks/useProductos'
import { ProductoForm } from '../components/ProductoForm'

const PAGE_SIZE = 10

export default function ProductosPage(): JSX.Element {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [soloBajoStock, setSoloBajoStock] = useState(false)
  const debouncedSearch = useDebounce(search, 300)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProductoDTO | null>(null)
  const [toDelete, setToDelete] = useState<ProductoDTO | null>(null)

  const params = useMemo(
    () => ({ search: debouncedSearch, page, pageSize: PAGE_SIZE, soloBajoStock }),
    [debouncedSearch, page, soloBajoStock]
  )
  const { data, isLoading } = useProductos(params)
  const { data: categorias = [] } = useCategorias()
  const createMutation = useCreateProducto()
  const updateMutation = useUpdateProducto()
  const removeMutation = useRemoveProducto()

  const openCreate = (): void => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (producto: ProductoDTO): void => {
    setEditing(producto)
    setModalOpen(true)
  }

  const handleSubmit = (values: ProductoFormValues): void => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, input: values }, { onSuccess: () => setModalOpen(false) })
    } else {
      createMutation.mutate(values, { onSuccess: () => setModalOpen(false) })
    }
  }

  const columns: Column<ProductoDTO>[] = [
    { header: 'Código', key: 'codigo', render: (p) => <span className="font-mono text-xs">{p.codigo}</span> },
    { header: 'Nombre', key: 'nombre', render: (p) => <span className="font-medium">{p.nombre}</span> },
    { header: 'Categoría', key: 'categoria', render: (p) => p.categoriaNombre ?? '—' },
    { header: 'Precio venta', key: 'precioVenta', render: (p) => formatCurrency(p.precioVenta) },
    {
      header: 'Stock',
      key: 'stock',
      render: (p) => (
        <div className="flex items-center gap-2">
          <span>{p.stock}</span>
          {p.bajoStock && (
            <Badge tone="red">
              <AlertTriangle className="mr-1 inline h-3 w-3" /> Bajo
            </Badge>
          )}
        </div>
      )
    },
    {
      header: '',
      key: 'acciones',
      className: 'text-right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => openEdit(p)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setToDelete(p)}
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
        title="Productos"
        description="Controla tu catálogo, precios e inventario."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nuevo producto
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput
            placeholder="Buscar por nombre o código…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="max-w-md flex-1"
          />
          <button
            onClick={() => {
              setSoloBajoStock((v) => !v)
              setPage(1)
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              soloBajoStock
                ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
                : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            <AlertTriangle className="h-4 w-4" /> Bajo stock
          </button>
        </div>

        <Table
          columns={columns}
          data={data?.data ?? []}
          rowKey={(p) => p.id}
          loading={isLoading}
          emptyTitle="No hay productos"
          emptyDescription="Agrega tu primer producto al catálogo."
          emptyIcon={<Package className="h-6 w-6" />}
        />

        {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
      </Card>

      <Modal open={modalOpen} title={editing ? 'Editar producto' : 'Nuevo producto'} onClose={() => setModalOpen(false)} size="lg">
        <ProductoForm
          initialData={editing}
          categorias={categorias}
          loading={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar producto"
        message={`¿Seguro que deseas eliminar "${toDelete?.nombre}"? Si tiene ventas asociadas, solo se desactivará.`}
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

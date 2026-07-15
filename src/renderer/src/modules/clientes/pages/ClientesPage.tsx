import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, UserX } from 'lucide-react'
import type { ClienteDTO } from '@shared/types/dto'
import type { ClienteFormValues } from '@shared/schemas/cliente.schema'
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
import { useClientes, useCreateCliente, useRemoveCliente, useUpdateCliente } from '../hooks/useClientes'
import { ClienteForm } from '../components/ClienteForm'

const PAGE_SIZE = 10

export default function ClientesPage(): JSX.Element {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 300)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ClienteDTO | null>(null)
  const [toDelete, setToDelete] = useState<ClienteDTO | null>(null)

  const params = useMemo(() => ({ search: debouncedSearch, page, pageSize: PAGE_SIZE }), [debouncedSearch, page])
  const { data, isLoading } = useClientes(params)
  const createMutation = useCreateCliente()
  const updateMutation = useUpdateCliente()
  const removeMutation = useRemoveCliente()

  const openCreate = (): void => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (cliente: ClienteDTO): void => {
    setEditing(cliente)
    setModalOpen(true)
  }

  const handleSubmit = (values: ClienteFormValues): void => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, input: values },
        { onSuccess: () => setModalOpen(false) }
      )
    } else {
      createMutation.mutate(values, { onSuccess: () => setModalOpen(false) })
    }
  }

  const columns: Column<ClienteDTO>[] = [
    { header: 'Nombre', key: 'nombre', render: (c) => <span className="font-medium">{c.nombre}</span> },
    { header: 'Teléfono', key: 'telefono', render: (c) => c.telefono ?? '—' },
    { header: 'Dirección', key: 'direccion', render: (c) => c.direccion ?? '—' },
    {
      header: 'Estado',
      key: 'estado',
      render: (c) => (c.activo ? <Badge tone="green">Activo</Badge> : <Badge tone="slate">Inactivo</Badge>)
    },
    {
      header: '',
      key: 'acciones',
      className: 'text-right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => openEdit(c)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
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
        title="Clientes"
        description="Gestiona la información de tus clientes."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nuevo cliente
          </Button>
        }
      />

      <Card>
        <SearchInput
          placeholder="Buscar por nombre o teléfono…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="mb-4 max-w-md"
        />

        <Table
          columns={columns}
          data={data?.data ?? []}
          rowKey={(c) => c.id}
          loading={isLoading}
          emptyTitle="No hay clientes"
          emptyDescription="Registra tu primer cliente para empezar a facturar."
          emptyIcon={<UserX className="h-6 w-6" />}
        />

        {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
      </Card>

      <Modal open={modalOpen} title={editing ? 'Editar cliente' : 'Nuevo cliente'} onClose={() => setModalOpen(false)}>
        <ClienteForm
          initialData={editing}
          loading={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar cliente"
        message={`¿Seguro que deseas eliminar a "${toDelete?.nombre}"? Si tiene ventas asociadas, solo se desactivará.`}
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

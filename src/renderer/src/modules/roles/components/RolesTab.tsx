import { useState } from 'react'
import { Lock, Pencil, Plus, Trash2 } from 'lucide-react'
import type { RolDTO } from '@shared/types/dto'
import { Card } from '../../../shared/components/Card'
import { Button } from '../../../shared/components/Button'
import { Table, type Column } from '../../../shared/components/Table'
import { Badge } from '../../../shared/components/Badge'
import { Modal } from '../../../shared/components/Modal'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { useCreateRol, useRemoveRol, useRoles, useUpdateRol } from '../hooks/useRoles'
import { RolForm } from './RolForm'

/** Gestión de roles y sus permisos. Solo visible para el Administrador. */
export function RolesTab(): JSX.Element {
  const { data: roles = [], isLoading } = useRoles()
  const createMutation = useCreateRol()
  const updateMutation = useUpdateRol()
  const removeMutation = useRemoveRol()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RolDTO | null>(null)
  const [toDelete, setToDelete] = useState<RolDTO | null>(null)

  const handleSubmit = (values: { nombre: string; descripcion: string; permisos: string[] }): void => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, input: values }, { onSuccess: () => setModalOpen(false) })
    } else {
      createMutation.mutate(values, { onSuccess: () => setModalOpen(false) })
    }
  }

  const columns: Column<RolDTO>[] = [
    {
      header: 'Rol',
      key: 'nombre',
      render: (r) => (
        <div>
          <p className="flex items-center gap-1.5 font-medium">
            {r.esSistema && <Lock className="h-3.5 w-3.5 text-slate-400" />}
            {r.nombre}
          </p>
          {r.descripcion && <p className="text-xs text-slate-400">{r.descripcion}</p>}
        </div>
      )
    },
    {
      header: 'Permisos',
      key: 'permisos',
      render: (r) => <Badge tone={r.esSistema ? 'blue' : 'slate'}>{r.esSistema ? 'Todos' : `${r.permisos.length} permisos`}</Badge>
    },
    { header: 'Usuarios', key: 'usuarios', render: (r) => r.totalUsuarios },
    {
      header: '',
      key: 'acciones',
      className: 'text-right',
      render: (r) =>
        r.esSistema ? (
          <span className="text-xs text-slate-400">Rol del sistema</span>
        ) : (
          <div className="flex justify-end gap-1">
            <button
              onClick={() => {
                setEditing(r)
                setModalOpen(true)
              }}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Editar rol"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setToDelete(r)}
              className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
              title="Eliminar rol"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
    }
  ]

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-medium text-slate-800 dark:text-slate-200">Roles y permisos</h2>
          <p className="text-sm text-slate-400">
            Define qué puede hacer cada tipo de usuario y asígnalo en la pestaña Usuarios.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> Nuevo rol
        </Button>
      </div>

      <Table columns={columns} data={roles} rowKey={(r) => r.id} loading={isLoading} emptyTitle="Sin roles" />

      <Modal open={modalOpen} title={editing ? `Editar rol: ${editing.nombre}` : 'Nuevo rol'} onClose={() => setModalOpen(false)} size="lg">
        <RolForm
          key={editing?.id ?? 'nuevo'}
          initialData={editing}
          loading={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar rol"
        message={`¿Seguro que deseas eliminar el rol "${toDelete?.nombre}"? Solo se puede eliminar si no tiene usuarios asignados.`}
        danger
        loading={removeMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) removeMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
        }}
      />
    </Card>
  )
}

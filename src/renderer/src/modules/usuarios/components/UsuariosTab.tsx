import { useState } from 'react'
import { Pencil, Plus, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import type { UsuarioDTO } from '@shared/types/dto'
import type { UsuarioFormValues } from '@shared/schemas/auth.schema'
import { Card } from '../../../shared/components/Card'
import { Button } from '../../../shared/components/Button'
import { Table, type Column } from '../../../shared/components/Table'
import { Badge } from '../../../shared/components/Badge'
import { Modal } from '../../../shared/components/Modal'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { useCreateUsuario, useRemoveUsuario, useRolesUsuarios, useUpdateUsuario, useUsuarios } from '../hooks/useUsuarios'
import { UsuarioForm } from './UsuarioForm'

export function UsuariosTab(): JSX.Element {
  const { data: usuarios = [], isLoading } = useUsuarios()
  const { data: roles = [] } = useRolesUsuarios()
  const createMutation = useCreateUsuario()
  const updateMutation = useUpdateUsuario()
  const removeMutation = useRemoveUsuario()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<UsuarioDTO | null>(null)
  const [toDelete, setToDelete] = useState<UsuarioDTO | null>(null)

  const handleSubmit = (values: UsuarioFormValues): void => {
    if (editing) {
      const { password, ...resto } = values
      updateMutation.mutate(
        { id: editing.id, input: { ...resto, password: password || undefined } },
        { onSuccess: () => setModalOpen(false) }
      )
    } else {
      createMutation.mutate(values, { onSuccess: () => setModalOpen(false) })
    }
  }

  const columns: Column<UsuarioDTO>[] = [
    {
      header: 'Nombre',
      key: 'nombre',
      render: (u) => (
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-slate-400" />
          <div>
            <p className="font-medium">{u.nombre}</p>
            <p className="text-xs text-slate-400">@{u.usuario}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Rol',
      key: 'rol',
      render: (u) => (
        <Badge tone={u.esAdministrador ? 'blue' : 'slate'}>
          {u.esAdministrador && <ShieldCheck className="mr-1 inline h-3 w-3" />}
          {u.rolNombre}
        </Badge>
      )
    },
    { header: 'Estado', key: 'activo', render: (u) => <Badge tone={u.activo ? 'green' : 'red'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge> },
    {
      header: '',
      key: 'acciones',
      className: 'text-right',
      render: (u) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => {
              setEditing(u)
              setModalOpen(true)
            }}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setToDelete(u)}
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
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-medium text-slate-800 dark:text-slate-200">Usuarios del sistema</h2>
          <p className="text-sm text-slate-400">Controla quién puede acceder a NovaPOS y con qué rol.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> Nuevo usuario
        </Button>
      </div>

      <Table columns={columns} data={usuarios} rowKey={(u) => u.id} loading={isLoading} emptyTitle="Sin usuarios registrados" />

      <Modal open={modalOpen} title={editing ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setModalOpen(false)}>
        <UsuarioForm
          initialData={editing}
          roles={roles}
          loading={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar usuario"
        message={`¿Seguro que deseas eliminar a "${toDelete?.nombre}"? Si tiene ventas registradas, solo se desactivará.`}
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

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { UsuarioDTO, RolDTO } from '@shared/types/dto'
import { usuarioSchema, usuarioUpdateSchema, type UsuarioFormValues } from '@shared/schemas/auth.schema'
import { Input } from '../../../shared/components/Input'
import { Select } from '../../../shared/components/Select'
import { Button } from '../../../shared/components/Button'

interface UsuarioFormProps {
  initialData: UsuarioDTO | null
  roles: RolDTO[]
  loading?: boolean
  onSubmit: (values: UsuarioFormValues) => void
  onCancel: () => void
}

export function UsuarioForm({ initialData, roles, loading, onSubmit, onCancel }: UsuarioFormProps): JSX.Element {
  const esNuevo = !initialData
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(esNuevo ? usuarioSchema : usuarioUpdateSchema),
    defaultValues: initialData
      ? { nombre: initialData.nombre, usuario: initialData.usuario, rolId: initialData.rolId, password: '' }
      : { nombre: '', usuario: '', password: '', rolId: roles[0]?.id }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nombre completo *" error={errors.nombre?.message} {...register('nombre')} />
      <Input label="Usuario *" hint="Sin espacios, usado para iniciar sesión" error={errors.usuario?.message} {...register('usuario')} />
      <Select label="Rol *" error={errors.rolId?.message} {...register('rolId')}>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.nombre}
          </option>
        ))}
      </Select>
      <Input
        label={esNuevo ? 'Contraseña *' : 'Nueva contraseña'}
        type="password"
        hint={esNuevo ? 'Mínimo 6 caracteres' : 'Déjalo en blanco para no cambiarla'}
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          Guardar
        </Button>
      </div>
    </form>
  )
}

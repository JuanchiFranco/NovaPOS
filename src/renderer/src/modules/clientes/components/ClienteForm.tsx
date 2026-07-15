import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { clienteSchema, type ClienteFormValues } from '@shared/schemas/cliente.schema'
import type { ClienteDTO } from '@shared/types/dto'
import { Input } from '../../../shared/components/Input'
import { Button } from '../../../shared/components/Button'

interface ClienteFormProps {
  initialData?: ClienteDTO | null
  loading?: boolean
  onSubmit: (values: ClienteFormValues) => void
  onCancel: () => void
}

export function ClienteForm({ initialData, loading, onSubmit, onCancel }: ClienteFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: initialData?.nombre ?? '',
      telefono: initialData?.telefono ?? '',
      direccion: initialData?.direccion ?? ''
    }
  })

  useEffect(() => {
    reset({
      nombre: initialData?.nombre ?? '',
      telefono: initialData?.telefono ?? '',
      direccion: initialData?.direccion ?? ''
    })
  }, [initialData, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nombre completo *" error={errors.nombre?.message} {...register('nombre')} />
      <Input label="Teléfono" error={errors.telefono?.message} {...register('telefono')} />
      <Input label="Dirección" error={errors.direccion?.message} {...register('direccion')} />
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

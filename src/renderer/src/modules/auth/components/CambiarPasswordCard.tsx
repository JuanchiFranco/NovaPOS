import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { KeyRound } from 'lucide-react'
import { cambiarPasswordSchema, type CambiarPasswordFormValues } from '@shared/schemas/auth.schema'
import { Card } from '../../../shared/components/Card'
import { Input } from '../../../shared/components/Input'
import { Button } from '../../../shared/components/Button'

export function CambiarPasswordCard(): JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CambiarPasswordFormValues>({ resolver: zodResolver(cambiarPasswordSchema) })

  const onSubmit = async (values: CambiarPasswordFormValues): Promise<void> => {
    try {
      await window.api.auth.cambiarPassword({ actual: values.actual, nueva: values.nueva })
      toast.success('Contraseña actualizada')
      reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo cambiar la contraseña')
    }
  }

  return (
    <Card className="space-y-4">
      <h2 className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
        <KeyRound className="h-4 w-4" /> Cambiar mi contraseña
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input label="Contraseña actual" type="password" error={errors.actual?.message} {...register('actual')} />
        <Input label="Nueva contraseña" type="password" error={errors.nueva?.message} {...register('nueva')} />
        <Input label="Confirmar nueva contraseña" type="password" error={errors.confirmar?.message} {...register('confirmar')} />
        <Button type="submit" variant="secondary" className="w-full" loading={isSubmitting}>
          Actualizar contraseña
        </Button>
      </form>
    </Card>
  )
}

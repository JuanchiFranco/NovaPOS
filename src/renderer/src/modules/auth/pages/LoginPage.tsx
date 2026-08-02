import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole, LogIn } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '@shared/schemas/auth.schema'
import { Input } from '../../../shared/components/Input'
import { Button } from '../../../shared/components/Button'
import { useConfiguracion } from '../../configuracion/hooks/useConfiguracion'
import { useSessionStore } from '../../../shared/store/session.store'

export default function LoginPage(): JSX.Element {
  const [error, setError] = useState<string | null>(null)
  const login = useSessionStore((s) => s.login)
  const { data: config } = useConfiguracion()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setError(null)
    try {
      await login(values.usuario, values.password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    }
  }

  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          {config?.logoDataUrl ? (
            <img src={config.logoDataUrl} alt="Logo" className="h-14 w-14 rounded-xl object-contain" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600 text-white">
              <LockKeyhole className="h-6 w-6" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {config?.nombreComercial ?? 'NovaPOS'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Inicia sesión para continuar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          <Input label="Usuario" autoFocus error={errors.usuario?.message} {...register('usuario')} />
          <Input label="Contraseña" type="password" error={errors.password?.message} {...register('password')} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" loading={isSubmitting}>
            <LogIn className="h-4 w-4" /> Iniciar sesión
          </Button>
        </form>
      </div>
    </div>
  )
}

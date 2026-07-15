import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Image as ImageIcon, Save } from 'lucide-react'
import { configuracionSchema, type ConfiguracionFormValues } from '@shared/schemas/configuracion.schema'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Card } from '../../../shared/components/Card'
import { Input } from '../../../shared/components/Input'
import { TextArea } from '../../../shared/components/TextArea'
import { Button } from '../../../shared/components/Button'
import { Spinner } from '../../../shared/components/Spinner'
import { ErrorState } from '../../../shared/components/ErrorState'
import { useConfiguracion, useSeleccionarLogo, useUpdateConfiguracion } from '../hooks/useConfiguracion'

export default function ConfiguracionPage(): JSX.Element {
  const { data: config, isLoading, isError, error, refetch } = useConfiguracion()
  const updateMutation = useUpdateConfiguracion()
  const logoMutation = useSeleccionarLogo()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ConfiguracionFormValues>({
    resolver: zodResolver(configuracionSchema)
  })

  useEffect(() => {
    if (config) {
      reset({
        nombreComercial: config.nombreComercial,
        eslogan: config.eslogan ?? '',
        mensajePie: config.mensajePie ?? '',
        nit: config.nit ?? '',
        direccion: config.direccion ?? '',
        telefono: config.telefono ?? '',
        correo: config.correo ?? '',
        porcentajeIva: config.porcentajeIva,
        moneda: config.moneda,
        simboloMoneda: config.simboloMoneda,
        prefijoFactura: config.prefijoFactura,
        numeroInicialFactura: config.numeroInicialFactura
      })
    }
  }, [config, reset])

  if (isLoading) return <Spinner />
  if (isError || !config) {
    return (
      <ErrorState
        title="No se pudo cargar la configuración"
        description={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    )
  }

  const onSubmit = (values: ConfiguracionFormValues): void => {
    updateMutation.mutate(values)
  }

  return (
    <div>
      <PageHeader title="Configuración" description="Datos del negocio usados en facturas y reportes." />

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-4">
          <h2 className="font-medium text-slate-800 dark:text-slate-200">Información del negocio</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nombre comercial" error={errors.nombreComercial?.message} {...register('nombreComercial')} />
            <Input label="NIT" error={errors.nit?.message} {...register('nit')} />
            <Input label="Teléfono" error={errors.telefono?.message} {...register('telefono')} />
            <Input label="Correo" type="email" error={errors.correo?.message} {...register('correo')} />
            <Input
              label="Dirección"
              className="sm:col-span-2"
              error={errors.direccion?.message}
              {...register('direccion')}
            />
            <Input
              label="Eslogan"
              hint="Aparece debajo del nombre en la factura. Ej: VENTA DE: VELAS, VELADORAS Y MUCHO MAS"
              className="sm:col-span-2"
              error={errors.eslogan?.message}
              {...register('eslogan')}
            />
            <TextArea
              label="Mensaje de pie de factura"
              hint="Texto de despedida o invitación que aparece al final de la factura."
              rows={3}
              className="sm:col-span-2"
              error={errors.mensajePie?.message}
              {...register('mensajePie')}
            />
          </div>

          <h2 className="pt-2 font-medium text-slate-800 dark:text-slate-200">Facturación</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Moneda (ISO)" error={errors.moneda?.message} {...register('moneda')} />
            <Input label="Símbolo de moneda" error={errors.simboloMoneda?.message} {...register('simboloMoneda')} />
            <Input label="Prefijo de factura" error={errors.prefijoFactura?.message} {...register('prefijoFactura')} />
            <Input
              label="Número inicial de factura"
              type="number"
              hint={`Próxima factura a emitir: #${config.siguienteNumeroFactura}`}
              error={errors.numeroInicialFactura?.message}
              {...register('numeroInicialFactura')}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={updateMutation.isPending} disabled={!isDirty}>
              <Save className="h-4 w-4" /> Guardar cambios
            </Button>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-medium text-slate-800 dark:text-slate-200">Logo del negocio</h2>
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            {config.logoDataUrl ? (
              <img src={config.logoDataUrl} alt="Logo" className="max-h-28 max-w-full object-contain" />
            ) : (
              <ImageIcon className="h-8 w-8 text-slate-300" />
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            loading={logoMutation.isPending}
            onClick={() => logoMutation.mutate()}
          >
            Seleccionar logo…
          </Button>
          <p className="text-xs text-slate-400">
            Se usará en la cabecera de las facturas impresas y exportadas a PDF.
          </p>
        </Card>
      </form>
    </div>
  )
}

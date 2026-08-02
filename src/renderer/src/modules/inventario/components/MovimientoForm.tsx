import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { movimientoInventarioSchema, type MovimientoInventarioFormValues } from '@shared/schemas/inventario.schema'
import { ProductoAutocomplete } from '../../../shared/components/ProductoAutocomplete'
import { Select } from '../../../shared/components/Select'
import { Input } from '../../../shared/components/Input'
import { TextArea } from '../../../shared/components/TextArea'
import { Button } from '../../../shared/components/Button'

interface MovimientoFormProps {
  loading?: boolean
  onSubmit: (values: MovimientoInventarioFormValues) => void
  onCancel: () => void
}

const tipoLabel: Record<MovimientoInventarioFormValues['tipo'], string> = {
  ENTRADA: 'Entrada de mercancía',
  SALIDA: 'Salida manual',
  AJUSTE: 'Ajuste por conteo físico'
}

export function MovimientoForm({ loading, onSubmit, onCancel }: MovimientoFormProps): JSX.Element {
  const [productoId, setProductoId] = useState<number | null>(null)
  const [productoNombre, setProductoNombre] = useState<string | null>(null)
  const [stockActual, setStockActual] = useState<number | undefined>(undefined)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<MovimientoInventarioFormValues>({
    resolver: zodResolver(movimientoInventarioSchema),
    defaultValues: { productoId: 0, tipo: 'ENTRADA', cantidad: 0, motivo: '' }
  })

  const tipo = watch('tipo')

  const handleProductoChange = (id: number | null, nombre: string | null, stock?: number): void => {
    setProductoId(id)
    setProductoNombre(nombre)
    setStockActual(stock)
    setValue('productoId', id ?? 0, { shouldValidate: true })
    if (tipo === 'AJUSTE' && stock !== undefined) {
      setValue('cantidad', stock)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Producto *</label>
        <ProductoAutocomplete productoId={productoId} productoNombre={productoNombre} onChange={handleProductoChange} />
        {errors.productoId && <p className="mt-1 text-xs text-red-500">{errors.productoId.message}</p>}
        {stockActual !== undefined && (
          <p className="mt-1 text-xs text-slate-400">Stock actual: {stockActual} unidades</p>
        )}
      </div>

      <Select label="Tipo de movimiento" {...register('tipo')}>
        {(Object.keys(tipoLabel) as (keyof typeof tipoLabel)[]).map((value) => (
          <option key={value} value={value}>
            {tipoLabel[value]}
          </option>
        ))}
      </Select>

      <Input
        label={tipo === 'AJUSTE' ? 'Nuevo stock (conteo físico) *' : 'Cantidad *'}
        type="number"
        min={0}
        error={errors.cantidad?.message}
        {...register('cantidad')}
      />

      <TextArea
        label="Motivo *"
        placeholder="Ej. Reposición de proveedor, merma, conteo mensual…"
        error={errors.motivo?.message}
        {...register('motivo')}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading} disabled={!productoId}>
          Registrar movimiento
        </Button>
      </div>
    </form>
  )
}

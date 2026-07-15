import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productoSchema, type ProductoFormValues } from '@shared/schemas/producto.schema'
import type { CategoriaDTO, ProductoDTO } from '@shared/types/dto'
import { Input } from '../../../shared/components/Input'
import { TextArea } from '../../../shared/components/TextArea'
import { Button } from '../../../shared/components/Button'

interface ProductoFormProps {
  initialData?: ProductoDTO | null
  categorias: CategoriaDTO[]
  loading?: boolean
  onSubmit: (values: ProductoFormValues) => void
  onCancel: () => void
}

export function ProductoForm({ initialData, categorias, loading, onSubmit, onCancel }: ProductoFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      codigo: initialData?.codigo ?? '',
      nombre: initialData?.nombre ?? '',
      categoriaId: initialData?.categoriaId ?? undefined,
      precioCompra: initialData?.precioCompra ?? 0,
      precioVenta: initialData?.precioVenta ?? 0,
      stock: initialData?.stock ?? 0,
      stockMinimo: initialData?.stockMinimo ?? 5,
      descripcion: initialData?.descripcion ?? ''
    }
  })

  useEffect(() => {
    reset({
      codigo: initialData?.codigo ?? '',
      nombre: initialData?.nombre ?? '',
      categoriaId: initialData?.categoriaId ?? undefined,
      precioCompra: initialData?.precioCompra ?? 0,
      precioVenta: initialData?.precioVenta ?? 0,
      stock: initialData?.stock ?? 0,
      stockMinimo: initialData?.stockMinimo ?? 5,
      descripcion: initialData?.descripcion ?? ''
    })
  }, [initialData, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Código *" error={errors.codigo?.message} {...register('codigo')} />
        <Input label="Nombre *" error={errors.nombre?.message} {...register('nombre')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoría</label>
          <select
            className="input-base"
            {...register('categoriaId', { setValueAs: (v) => (v === '' ? null : Number(v)) })}
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <Input label="Nueva categoría (opcional)" {...register('categoriaNombre')} placeholder="Ej: Bebidas" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Precio de compra *"
          type="number"
          step="0.01"
          error={errors.precioCompra?.message}
          {...register('precioCompra')}
        />
        <Input
          label="Precio de venta *"
          type="number"
          step="0.01"
          error={errors.precioVenta?.message}
          {...register('precioVenta')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Stock actual *" type="number" error={errors.stock?.message} {...register('stock')} />
        <Input
          label="Stock mínimo *"
          type="number"
          hint="Se generará alerta bajo este valor"
          error={errors.stockMinimo?.message}
          {...register('stockMinimo')}
        />
      </div>

      <TextArea label="Descripción" error={errors.descripcion?.message} {...register('descripcion')} />

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
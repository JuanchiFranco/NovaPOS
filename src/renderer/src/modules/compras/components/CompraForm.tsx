import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { facturaCompraSchema, type FacturaCompraFormValues } from '@shared/schemas/facturaCompra.schema'
import { Input } from '../../../shared/components/Input'
import { TextArea } from '../../../shared/components/TextArea'
import { Select } from '../../../shared/components/Select'
import { Button } from '../../../shared/components/Button'
import { formatCurrency } from '../../../shared/lib/format'

interface CompraFormProps {
  loading?: boolean
  onSubmit: (values: FacturaCompraFormValues) => void
  onCancel: () => void
}

const emptyItem = { descripcion: '', cantidad: 1, valorUnitario: 0 }

export function CompraForm({ loading, onSubmit, onCancel }: CompraFormProps): JSX.Element {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FacturaCompraFormValues>({
    resolver: zodResolver(facturaCompraSchema),
    defaultValues: {
      proveedorNombre: '',
      numeroFactura: '',
      fecha: new Date().toISOString().slice(0, 10),
      notas: '',
      items: [emptyItem]
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = watch('items')
  const total = items.reduce(
    (acc, item) => acc + (Number(item.cantidad) || 0) * (Number(item.valorUnitario) || 0),
    0
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Proveedor *" error={errors.proveedorNombre?.message} {...register('proveedorNombre')} />
        <Input
          label="N.º de factura del proveedor"
          error={errors.numeroFactura?.message}
          {...register('numeroFactura')}
        />
        <Input label="Fecha" type="date" error={errors.fecha?.message} {...register('fecha')} />
        <Select label="Método de pago" error={errors.metodoPago?.message} {...register('metodoPago')}>
          <option value="">Sin especificar</option>
          <option value="EFECTIVO">Efectivo</option>
          <option value="TARJETA">Tarjeta</option>
          <option value="TRANSFERENCIA">Transferencia</option>
        </Select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ítems comprados</label>
          <Button type="button" variant="secondary" size="sm" onClick={() => append(emptyItem)}>
            <Plus className="h-4 w-4" /> Agregar ítem
          </Button>
        </div>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 items-start gap-2">
              <Input
                className="col-span-6"
                placeholder="Descripción"
                error={errors.items?.[index]?.descripcion?.message}
                {...register(`items.${index}.descripcion`)}
              />
              <Input
                className="col-span-2"
                type="number"
                placeholder="Cant."
                error={errors.items?.[index]?.cantidad?.message}
                {...register(`items.${index}.cantidad`)}
              />
              <Input
                className="col-span-3"
                type="number"
                step="0.01"
                placeholder="Valor unit."
                error={errors.items?.[index]?.valorUnitario?.message}
                {...register(`items.${index}.valorUnitario`)}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                className="col-span-1 flex h-10 items-center justify-center rounded-md text-red-500 hover:bg-red-50 disabled:opacity-30 dark:hover:bg-red-950/40"
                title="Quitar ítem"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {errors.items?.message && <p className="mt-1 text-xs text-red-500">{errors.items.message}</p>}
      </div>

      <TextArea label="Notas" error={errors.notas?.message} {...register('notas')} />

      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 dark:bg-slate-800/60 dark:text-slate-100">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

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

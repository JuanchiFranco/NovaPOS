import { z } from 'zod'

const productoBaseSchema = z.object({
  codigo: z.string().trim().min(1, 'El código es obligatorio').max(50),
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  categoriaId: z.number().int().positive().optional().nullable(),
  categoriaNombre: z.string().trim().max(80).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  precioCompra: z.coerce.number().min(0, 'El precio de compra no puede ser negativo'),
  precioVenta: z.coerce.number().min(0.01, 'El precio de venta debe ser mayor a 0'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  stockMinimo: z.coerce.number().int().min(0, 'El stock mínimo no puede ser negativo'),
  descripcion: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v))
})

const precioVentaValida = {
  message: 'El precio de venta debe ser mayor o igual al precio de compra',
  path: ['precioVenta']
}

export const productoSchema = productoBaseSchema.refine(
  (data) => data.precioVenta >= data.precioCompra,
  precioVentaValida
)

export const productoUpdateSchema = productoBaseSchema.partial().refine(
  (data) => data.precioVenta === undefined || data.precioCompra === undefined || data.precioVenta >= data.precioCompra,
  precioVentaValida
)

export type ProductoFormValues = z.infer<typeof productoSchema>

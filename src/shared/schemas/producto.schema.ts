import { z } from 'zod'

const precioMayoristaSchema = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? null : Number(v)),
  z.number().min(0, 'El precio al por mayor no puede ser negativo').nullable()
)

const productoBaseSchema = z.object({
  codigo: z.string().trim().min(1, 'El código es obligatorio').max(50),
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  categoriaId: z.number().int().positive().optional().nullable(),
  categoriaNombre: z.string().trim().max(80).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  precioCompra: z.coerce.number().min(0, 'El precio de compra no puede ser negativo'),
  precioVenta: z.coerce.number().min(0.01, 'El precio al detal debe ser mayor a 0'),
  precioMayorista: precioMayoristaSchema.optional(),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  stockMinimo: z.coerce.number().int().min(0, 'El stock mínimo no puede ser negativo'),
  descripcion: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v))
})

const precioVentaValida = {
  message: 'El precio al detal debe ser mayor o igual al precio de compra',
  path: ['precioVenta']
}

const precioMayoristaValida = {
  message: 'El precio al por mayor no puede ser mayor que el precio al detal',
  path: ['precioMayorista']
}

export const productoSchema = productoBaseSchema
  .refine((data) => data.precioVenta >= data.precioCompra, precioVentaValida)
  .refine(
    (data) => !data.precioMayorista || data.precioMayorista <= data.precioVenta,
    precioMayoristaValida
  )

export const productoUpdateSchema = productoBaseSchema
  .partial()
  .refine(
    (data) => data.precioVenta === undefined || data.precioCompra === undefined || data.precioVenta >= data.precioCompra,
    precioVentaValida
  )
  .refine(
    (data) => !data.precioMayorista || data.precioVenta === undefined || data.precioMayorista <= data.precioVenta,
    precioMayoristaValida
  )

export type ProductoFormValues = z.infer<typeof productoSchema>

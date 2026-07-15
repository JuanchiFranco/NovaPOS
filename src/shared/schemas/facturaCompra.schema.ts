import { z } from 'zod'

export const metodoPagoCompraEnum = z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'])

export const itemCompraSchema = z.object({
  descripcion: z.string().trim().min(1, 'Obligatorio').max(200),
  cantidad: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
  valorUnitario: z.coerce.number().min(0)
})

export const facturaCompraSchema = z.object({
  proveedorNombre: z.string().trim().min(2, 'El nombre del proveedor debe tener al menos 2 caracteres').max(150),
  numeroFactura: z.string().trim().max(50).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  fecha: z.string().trim().optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  metodoPago: z
    .union([metodoPagoCompraEnum, z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  notas: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  items: z.array(itemCompraSchema).min(1, 'Agrega al menos un ítem a la compra')
})

export type FacturaCompraFormValues = z.infer<typeof facturaCompraSchema>
export type ItemCompraFormValues = z.infer<typeof itemCompraSchema>

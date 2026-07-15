import { z } from 'zod'

export const metodoPagoEnum = z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO'])

export const itemVentaSchema = z.object({
  productoId: z.number().int().positive(),
  cantidad: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
  precioUnitario: z.coerce.number().min(0),
  descuento: z.coerce.number().min(0).default(0)
})

export const ventaSchema = z
  .object({
    clienteId: z.number().int().positive().optional().nullable(),
    items: z.array(itemVentaSchema).min(1, 'Agrega al menos un producto a la venta'),
    descuentoGlobal: z.coerce.number().min(0).default(0),
    metodoPago: metodoPagoEnum,
    montoEfectivo: z.coerce.number().min(0).optional(),
    montoTarjeta: z.coerce.number().min(0).optional(),
    montoTransferencia: z.coerce.number().min(0).optional(),
    notas: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v))
  })
  .superRefine((data, ctx) => {
    if (data.metodoPago === 'MIXTO') {
      const suma = (data.montoEfectivo ?? 0) + (data.montoTarjeta ?? 0) + (data.montoTransferencia ?? 0)
      if (suma <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Para pago mixto especifica al menos un monto',
          path: ['montoEfectivo']
        })
      }
    }
  })

export type VentaFormValues = z.infer<typeof ventaSchema>
export type ItemVentaFormValues = z.infer<typeof itemVentaSchema>

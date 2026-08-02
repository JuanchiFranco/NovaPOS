import { z } from 'zod'

export const tipoMovimientoManualEnum = z.enum(['ENTRADA', 'SALIDA', 'AJUSTE'])

/**
 * Para ENTRADA/SALIDA, `cantidad` es la cantidad a mover (siempre > 0).
 * Para AJUSTE, `cantidad` representa el nuevo stock absoluto (ej. luego de un conteo físico).
 */
export const movimientoInventarioSchema = z
  .object({
    productoId: z.coerce.number().int().positive('Selecciona un producto'),
    tipo: tipoMovimientoManualEnum,
    cantidad: z.coerce.number().int().min(0, 'La cantidad no puede ser negativa'),
    motivo: z.string().trim().min(3, 'Describe el motivo del movimiento').max(300)
  })
  .refine((data) => data.tipo === 'AJUSTE' || data.cantidad > 0, {
    message: 'La cantidad debe ser mayor a 0',
    path: ['cantidad']
  })

export type MovimientoInventarioFormValues = z.infer<typeof movimientoInventarioSchema>

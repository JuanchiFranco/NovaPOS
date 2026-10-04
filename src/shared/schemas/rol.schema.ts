import { z } from 'zod'
import { TODOS_LOS_PERMISOS } from '../constants/permisos'

export const rolSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  descripcion: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v === '' ? undefined : v)),
  permisos: z.array(z.enum(TODOS_LOS_PERMISOS as [string, ...string[]])).default([])
})

export type RolFormValues = z.input<typeof rolSchema>

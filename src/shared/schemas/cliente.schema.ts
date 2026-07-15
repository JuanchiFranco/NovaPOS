import { z } from 'zod'

export const clienteSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  telefono: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v === '' ? undefined : v)),
  direccion: z.string().trim().max(200).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v))
})

export type ClienteFormValues = z.infer<typeof clienteSchema>

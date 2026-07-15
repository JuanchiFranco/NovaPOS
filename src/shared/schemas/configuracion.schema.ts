import { z } from 'zod'

export const configuracionSchema = z.object({
  nombreComercial: z.string().trim().min(2, 'Obligatorio').max(150),
  eslogan: z.string().trim().max(200).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  mensajePie: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  nit: z.string().trim().max(30).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  direccion: z.string().trim().max(200).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  telefono: z.string().trim().max(30).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  correo: z
    .string()
    .trim()
    .email('Correo inválido')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v === '' ? undefined : v)),
  porcentajeIva: z.coerce.number().min(0).max(100),
  moneda: z.string().trim().min(1).max(10),
  simboloMoneda: z.string().trim().min(1).max(5),
  prefijoFactura: z.string().trim().min(1).max(15),
  numeroInicialFactura: z.coerce.number().int().min(1)
})

export type ConfiguracionFormValues = z.infer<typeof configuracionSchema>

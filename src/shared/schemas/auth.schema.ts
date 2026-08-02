import { z } from 'zod'

export const loginSchema = z.object({
  usuario: z.string().trim().min(1, 'Ingresa tu usuario'),
  password: z.string().min(1, 'Ingresa tu contraseña')
})

export type LoginFormValues = z.infer<typeof loginSchema>

const passwordSchema = z
  .string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .max(100)

export const usuarioSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  usuario: z
    .string()
    .trim()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Solo letras, números, puntos, guiones y guion bajo'),
  password: passwordSchema,
  rolId: z.coerce.number().int().positive('Selecciona un rol')
})

export const usuarioUpdateSchema = usuarioSchema
  .partial()
  .extend({ password: passwordSchema.optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)) })

export type UsuarioFormValues = z.infer<typeof usuarioSchema>

export const cambiarPasswordSchema = z
  .object({
    actual: z.string().min(1, 'Ingresa tu contraseña actual'),
    nueva: passwordSchema,
    confirmar: z.string()
  })
  .refine((data) => data.nueva === data.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar']
  })

export type CambiarPasswordFormValues = z.infer<typeof cambiarPasswordSchema>

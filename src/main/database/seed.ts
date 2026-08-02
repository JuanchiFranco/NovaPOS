import type { PrismaClient } from '@prisma/client'
import { hashPassword } from '../shared/password'
import { logger } from '../shared/logger'

const ROL_ADMINISTRADOR = 'Administrador'
const ROL_VENDEDOR = 'Vendedor'

/**
 * Garantiza que exista el rol "Vendedor" (además del "Administrador" que ya
 * siembra prisma/init.sql) y un usuario administrador inicial si todavía no
 * hay ningún usuario registrado. Es idempotente: seguro de correr en cada arranque.
 */
export async function ensureAuthSeed(prisma: PrismaClient): Promise<void> {
  await prisma.rol.upsert({
    where: { nombre: ROL_VENDEDOR },
    create: {
      nombre: ROL_VENDEDOR,
      descripcion: 'Acceso a ventas, clientes, productos, inventario y compras (sin configuración ni usuarios)',
      permisos: JSON.stringify({
        ventas: true,
        clientes: true,
        productos: true,
        inventario: true,
        compras: true,
        facturas: true,
        reportes: true,
        configuracion: false,
        usuarios: false,
        auditoria: false
      })
    },
    update: {}
  })

  const totalUsuarios = await prisma.usuario.count()
  if (totalUsuarios > 0) return

  const adminRol = await prisma.rol.findUnique({ where: { nombre: ROL_ADMINISTRADOR } })
  if (!adminRol) return

  await prisma.usuario.create({
    data: {
      nombre: 'Administrador',
      usuario: 'admin',
      passwordHash: hashPassword('admin123'),
      rolId: adminRol.id
    }
  })
  logger.info('Usuario administrador inicial creado (usuario: "admin", contraseña: "admin123"). Cámbiala después de iniciar sesión.')
}

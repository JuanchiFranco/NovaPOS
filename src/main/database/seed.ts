import type { PrismaClient } from '@prisma/client'
import { PERMISOS_VENDEDOR, ROL_ADMINISTRADOR, esFormatoLegado, parsePermisos } from '@shared/constants/permisos'
import { hashPassword } from '../shared/password'
import { logger } from '../shared/logger'

const ROL_VENDEDOR = 'Vendedor'

/**
 * - Convierte los roles guardados con el formato antiguo de permisos (por módulo) al nuevo (lista de permisos).
 * - En la primera ejecución crea el rol "Vendedor" de ejemplo y un usuario administrador inicial.
 * Es idempotente: seguro de correr en cada arranque. El administrador crea después los roles que necesite
 * desde Configuración → Roles.
 */
export async function ensureAuthSeed(prisma: PrismaClient): Promise<void> {
  const roles = await prisma.rol.findMany()
  for (const rol of roles) {
    if (rol.nombre !== ROL_ADMINISTRADOR && esFormatoLegado(rol.permisos)) {
      await prisma.rol.update({ where: { id: rol.id }, data: { permisos: JSON.stringify(parsePermisos(rol.permisos)) } })
      logger.info('Permisos del rol migrados al nuevo formato', { rol: rol.nombre })
    }
  }

  const totalUsuarios = await prisma.usuario.count()
  if (totalUsuarios > 0) return

  await prisma.rol.upsert({
    where: { nombre: ROL_VENDEDOR },
    create: {
      nombre: ROL_VENDEDOR,
      descripcion: 'Opera la caja: vende, consulta facturas, productos y clientes (sin cambiar precios ni administrar)',
      permisos: JSON.stringify(PERMISOS_VENDEDOR)
    },
    update: {}
  })

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

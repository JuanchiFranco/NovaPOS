import { app } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

/**
 * Resuelve las rutas de datos de la aplicación.
 * En desarrollo la base vive en prisma/dev.db (fácil de inspeccionar con Prisma Studio).
 * En producción vive en el directorio de datos de usuario del sistema operativo.
 */
export function getDatabaseFilePath(): string {
  if (is.dev) {
    return join(process.cwd(), 'prisma', 'dev.db')
  }
  return join(app.getPath('userData'), 'database', 'inventario.db')
}

export function getBackupsDir(): string {
  if (is.dev) {
    return join(process.cwd(), 'prisma', 'backups')
  }
  return join(app.getPath('userData'), 'backups')
}

export function getInitSqlPath(): string {
  if (is.dev) {
    return join(process.cwd(), 'prisma', 'init.sql')
  }
  return join(process.resourcesPath, 'prisma', 'init.sql')
}

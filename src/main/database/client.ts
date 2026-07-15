import Module, { createRequire } from 'module'
import { delimiter } from 'path'
import { is } from '@electron-toolkit/utils'
import type { PrismaClient as PrismaClientType } from '@prisma/client'
import { ensureDatabaseSchema } from './migrate'

const require_ = createRequire(import.meta.url)

let prisma: PrismaClientType | null = null

/**
 * @prisma/client es CommonJS y su punto de entrada hace `require('.prisma/client/default')`
 * (el cliente generado, con el motor de consultas incluido). electron-builder no empaqueta
 * `.prisma` dentro de node_modules porque no es una dependencia declarada en package.json,
 * así que se copia aparte con `extraResources` (ver electron-builder.yml) y aquí se agrega
 * esa carpeta a NODE_PATH antes de requerir Prisma. Se usa `require` en vez de `import`
 * porque bajo "type": "module" Node no siempre detecta los named exports de este paquete CJS.
 */
function loadPrismaClient(): typeof import('@prisma/client') {
  if (!is.dev) {
    const existing = process.env.NODE_PATH
    process.env.NODE_PATH = existing ? `${existing}${delimiter}${process.resourcesPath}` : process.resourcesPath
    // NODE_PATH solo se lee al iniciar el proceso; hay que forzar a Node a recalcular sus rutas.
    ;(Module as unknown as { _initPaths: () => void })._initPaths()
  }
  return require_('@prisma/client')
}

/**
 * Devuelve una única instancia de PrismaClient para toda la app (singleton).
 * Debe llamarse después de `ensureDatabaseSchema()` en el bootstrap del main process.
 */
export function getPrismaClient(): PrismaClientType {
  if (!prisma) {
    const { PrismaClient } = loadPrismaClient()
    const dbPath = ensureDatabaseSchema()
    process.env.DATABASE_URL = `file:${dbPath}`
    prisma = new PrismaClient({
      datasources: { db: { url: `file:${dbPath}` } },
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
    })
  }
  return prisma
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}

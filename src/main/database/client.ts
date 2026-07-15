import { PrismaClient } from '@prisma/client'
import { ensureDatabaseSchema } from './migrate'

let prisma: PrismaClient | null = null

/**
 * Devuelve una única instancia de PrismaClient para toda la app (singleton).
 * Debe llamarse después de `ensureDatabaseSchema()` en el bootstrap del main process.
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
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

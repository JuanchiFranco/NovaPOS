import Database from 'better-sqlite3'
import { existsSync, mkdirSync, readFileSync } from 'fs'
import { dirname } from 'path'
import { getDatabaseFilePath, getInitSqlPath } from './paths'

/**
 * Garantiza que el esquema exista antes de que Prisma Client se conecte.
 * Es idempotente: usa CREATE TABLE IF NOT EXISTS, por lo que es seguro
 * ejecutarlo en cada arranque de la aplicación.
 */
export function ensureDatabaseSchema(): string {
  const dbPath = getDatabaseFilePath()
  mkdirSync(dirname(dbPath), { recursive: true })

  const initSqlPath = getInitSqlPath()
  if (!existsSync(initSqlPath)) {
    throw new Error(`No se encontró el script de inicialización de base de datos en: ${initSqlPath}`)
  }

  const sql = readFileSync(initSqlPath, 'utf-8')
  const db = new Database(dbPath)
  try {
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    // Debe ejecutarse antes de init.sql: sus sentencias INSERT referencian columnas
    // que en bases de datos ya existentes todavía no existen (SQLite valida las
    // columnas al preparar el statement, sin importar si el WHERE lo vuelve un no-op).
    addMissingColumns(db)
    db.exec(sql)
  } finally {
    db.close()
  }

  return dbPath
}

/**
 * Añade columnas nuevas a bases de datos creadas con una versión anterior de init.sql.
 * `CREATE TABLE IF NOT EXISTS` no altera tablas ya existentes, así que las columnas
 * agregadas después del primer arranque deben aplicarse aquí con ALTER TABLE.
 */
function addMissingColumns(db: Database.Database): void {
  const tableExists = db
    .prepare('SELECT 1 FROM sqlite_master WHERE type = ? AND name = ?')
    .get('table', 'configuracion')
  if (!tableExists) return // instalación nueva: init.sql crea la tabla ya con todas las columnas

  const columns = db.prepare('PRAGMA table_info("configuracion")').all() as { name: string }[]
  const columnNames = new Set(columns.map((c) => c.name))

  if (!columnNames.has('eslogan')) {
    db.exec('ALTER TABLE "configuracion" ADD COLUMN "eslogan" TEXT')
    db.prepare('UPDATE "configuracion" SET "eslogan" = ? WHERE "id" = 1 AND "eslogan" IS NULL').run(
      'VENTA DE: VELAS, VELADORAS Y MUCHO MAS'
    )
  }
  if (!columnNames.has('mensajePie')) {
    db.exec('ALTER TABLE "configuracion" ADD COLUMN "mensajePie" TEXT')
    db.prepare('UPDATE "configuracion" SET "mensajePie" = ? WHERE "id" = 1 AND "mensajePie" IS NULL').run(
      'HACERCATE PARA TENER EL GUSTO DE ATENDERTE\n\nTODO LO PUEDO EN CRISTO QUE ME FORTALECE'
    )
  }
}

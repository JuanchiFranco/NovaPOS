import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs'
import { join, basename } from 'path'
import type { BackupInfo } from '@shared/types/dto'
import { getBackupsDir, getDatabaseFilePath } from './paths'
import { logger } from '../shared/logger'

const MAX_BACKUPS = 20
const AUTO_BACKUP_INTERVAL_MS = 1000 * 60 * 60 * 6 // cada 6 horas

let intervalHandle: NodeJS.Timeout | null = null

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

export function createBackup(): BackupInfo {
  const dbPath = getDatabaseFilePath()
  const backupsDir = getBackupsDir()
  mkdirSync(backupsDir, { recursive: true })

  if (!existsSync(dbPath)) {
    throw new Error('No existe base de datos para respaldar todavía.')
  }

  const fileName = `inventario-${timestamp()}.db`
  const destPath = join(backupsDir, fileName)
  copyFileSync(dbPath, destPath)
  pruneOldBackups(backupsDir)

  logger.info('Backup creado', { fileName })
  const stats = statSync(destPath)
  return { fileName, createdAt: stats.mtime.toISOString(), sizeBytes: stats.size }
}

function pruneOldBackups(backupsDir: string): void {
  const files = readdirSync(backupsDir)
    .filter((f) => f.endsWith('.db'))
    .map((f) => ({ f, mtime: statSync(join(backupsDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)

  files.slice(MAX_BACKUPS).forEach(({ f }) => unlinkSync(join(backupsDir, f)))
}

export function listBackups(): BackupInfo[] {
  const backupsDir = getBackupsDir()
  if (!existsSync(backupsDir)) return []
  return readdirSync(backupsDir)
    .filter((f) => f.endsWith('.db'))
    .map((f) => {
      const stats = statSync(join(backupsDir, f))
      return { fileName: f, createdAt: stats.mtime.toISOString(), sizeBytes: stats.size }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function restoreBackup(fileName: string): void {
  const backupsDir = getBackupsDir()
  const backupPath = join(backupsDir, basename(fileName))
  if (!existsSync(backupPath)) {
    throw new Error('El archivo de respaldo indicado no existe.')
  }
  // Se respalda el estado actual antes de sobreescribir, por seguridad.
  createBackup()
  copyFileSync(backupPath, getDatabaseFilePath())
  logger.info('Base de datos restaurada desde backup', { fileName })
}

export function startAutoBackup(): void {
  if (intervalHandle) return
  intervalHandle = setInterval(() => {
    try {
      createBackup()
    } catch (error) {
      logger.error('Falló el backup automático', error)
    }
  }, AUTO_BACKUP_INTERVAL_MS)
}

export function stopAutoBackup(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle)
    intervalHandle = null
  }
}

import { app } from 'electron'
import { appendFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

function getLogFilePath(): string {
  const dir = is.dev ? join(process.cwd(), 'prisma') : join(app.getPath('userData'), 'logs')
  mkdirSync(dir, { recursive: true })
  return join(dir, 'app.log')
}

function write(level: string, message: string, meta?: unknown): void {
  const line = `[${new Date().toISOString()}] [${level}] ${message}${meta ? ' ' + JSON.stringify(meta) : ''}\n`
  // eslint-disable-next-line no-console
  console[level === 'ERROR' ? 'error' : 'log'](line.trim())
  try {
    appendFileSync(getLogFilePath(), line)
  } catch {
    // si el log a disco falla no debe interrumpir la app
  }
}

export const logger = {
  info: (message: string, meta?: unknown) => write('INFO', message, meta),
  warn: (message: string, meta?: unknown) => write('WARN', message, meta),
  error: (message: string, meta?: unknown) => write('ERROR', message, meta)
}

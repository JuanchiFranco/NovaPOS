import { ipcMain } from 'electron'
import { ZodError } from 'zod'
import type { ApiResult } from '@shared/types/dto'
import { logger } from './logger'
import { toUserMessage } from './errors'

/**
 * Envuelve ipcMain.handle con manejo de errores uniforme.
 * Todos los handlers devuelven siempre un ApiResult<T>, nunca lanzan hacia el renderer.
 */
export function handle<TArgs extends unknown[], TResult>(
  channel: string,
  fn: (...args: TArgs) => Promise<TResult> | TResult
): void {
  ipcMain.handle(channel, async (_event, ...args: TArgs): Promise<ApiResult<TResult>> => {
    try {
      const data = await fn(...args)
      return { ok: true, data }
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((e) => e.message).join(' | ')
        logger.warn(`Validación fallida en ${channel}`, message)
        return { ok: false, error: message }
      }
      logger.error(`Error en canal ${channel}`, error instanceof Error ? error.message : error)
      return { ok: false, error: toUserMessage(error) }
    }
  })
}

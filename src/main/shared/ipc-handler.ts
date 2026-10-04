import { ipcMain } from 'electron'
import { ZodError } from 'zod'
import type { ApiResult } from '@shared/types/dto'
import { logger } from './logger'
import { AppError, toUserMessage } from './errors'
import { getSessionUser, sessionDebeCambiarPassword } from '../modules/auth/session'

/**
 * Nivel de acceso exigido por un canal IPC. Se valida SIEMPRE en el main process,
 * no solo ocultando botones en la interfaz:
 *  - 'public': no requiere sesión (login, datos de marca para la pantalla de login).
 *  - 'auth'  : requiere sesión iniciada (valor por defecto).
 *  - 'admin' : requiere sesión de un usuario con rol Administrador.
 *  - 'session-setup': requiere sesión, y se permite incluso cuando está pendiente
 *    el cambio obligatorio de contraseña (logout, me, cambiar contraseña).
 */
export type IpcAccess = 'public' | 'auth' | 'admin' | 'session-setup'

function checkAccess(channel: string, access: IpcAccess): void {
  if (access === 'public') return

  const user = getSessionUser()
  if (!user) throw new AppError('Debes iniciar sesión para realizar esta acción.')

  if (access !== 'session-setup' && sessionDebeCambiarPassword()) {
    throw new AppError('Debes cambiar tu contraseña inicial antes de continuar.')
  }

  if (access === 'admin' && !user.esAdministrador) {
    logger.warn(`Acceso denegado al canal ${channel}`, { usuario: user.usuario })
    throw new AppError('No tienes permisos para realizar esta acción.')
  }
}

/**
 * Envuelve ipcMain.handle con control de acceso y manejo de errores uniforme.
 * Todos los handlers devuelven siempre un ApiResult<T>, nunca lanzan hacia el renderer.
 */
export function handle<TArgs extends unknown[], TResult>(
  channel: string,
  fn: (...args: TArgs) => Promise<TResult> | TResult,
  access: IpcAccess = 'auth'
): void {
  ipcMain.handle(channel, async (_event, ...args: TArgs): Promise<ApiResult<TResult>> => {
    try {
      checkAccess(channel, access)
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

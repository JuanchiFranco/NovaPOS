import type { PrismaClient } from '@prisma/client'
import { getSessionUserId } from '../auth/session'
import { logger } from '../../shared/logger'

export type AccionAuditoria = 'CREATE' | 'UPDATE' | 'DELETE'

/**
 * Registra un evento de auditoría. Se usa desde los repositories (que ya tienen
 * acceso a `prisma`) justo después de una mutación exitosa.
 * Nunca debe interrumpir la operación principal: cualquier fallo se registra en el log y se ignora.
 */
export async function registrarAuditoria(
  prisma: PrismaClient,
  entidad: string,
  entidadId: number,
  accion: AccionAuditoria,
  detalle?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.auditoria.create({
      data: {
        entidad,
        entidadId,
        accion,
        detalle: detalle ? JSON.stringify(detalle) : null,
        usuarioId: getSessionUserId()
      }
    })
  } catch (error) {
    logger.warn('No se pudo registrar auditoría', { entidad, entidadId, accion, error })
  }
}

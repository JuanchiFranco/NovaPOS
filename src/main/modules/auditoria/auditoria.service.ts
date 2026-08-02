import type { AuditoriaDTO, PaginatedResult } from '@shared/types/dto'
import type { AuditoriaListParams } from '@shared/types/requests'
import type { AuditoriaConUsuario, AuditoriaRepository } from './auditoria.repository'

function toDTO(a: AuditoriaConUsuario): AuditoriaDTO {
  return {
    id: a.id,
    entidad: a.entidad,
    entidadId: a.entidadId,
    accion: a.accion,
    detalle: a.detalle,
    usuarioId: a.usuarioId,
    usuarioNombre: a.usuario?.nombre ?? null,
    createdAt: a.createdAt.toISOString()
  }
}

export class AuditoriaService {
  constructor(private readonly repo: AuditoriaRepository) {}

  async list(params: AuditoriaListParams): Promise<PaginatedResult<AuditoriaDTO>> {
    const result = await this.repo.findMany(params)
    return { ...result, data: result.data.map(toDTO) }
  }

  async entidades(): Promise<string[]> {
    const rows = await this.repo.distinctEntidades()
    return rows.map((r) => r.entidad)
  }
}

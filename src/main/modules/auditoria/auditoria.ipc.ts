import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import type { AuditoriaService } from './auditoria.service'
import type { AuditoriaListParams } from '@shared/types/requests'

export function registerAuditoriaIpc(service: AuditoriaService): void {
  handle(IPC.auditoria.list, (params: AuditoriaListParams) => service.list(params ?? {}))
  handle(IPC.auditoria.entidades, () => service.entidades())
}

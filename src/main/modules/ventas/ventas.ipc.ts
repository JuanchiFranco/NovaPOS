import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import type { VentasService } from './ventas.service'
import type { VentaCreateInput, VentaListParams } from '@shared/types/requests'

export function registerVentasIpc(service: VentasService): void {
  handle(IPC.ventas.list, (params: VentaListParams) => service.list(params ?? {}))
  handle(IPC.ventas.getById, (id: number) => service.getById(id))
  handle(IPC.ventas.create, (input: VentaCreateInput) => service.create(input))
  handle(IPC.ventas.anular, (id: number) => service.anular(id))
}

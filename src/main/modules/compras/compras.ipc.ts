import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import type { ComprasService } from './compras.service'
import type { FacturaCompraCreateInput, FacturaCompraListParams } from '@shared/types/requests'

export function registerComprasIpc(service: ComprasService): void {
  handle(IPC.compras.list, (params: FacturaCompraListParams) => service.list(params ?? {}))
  handle(IPC.compras.getById, (id: number) => service.getById(id))
  handle(IPC.compras.create, (input: FacturaCompraCreateInput) => service.create(input))
  handle(IPC.compras.remove, (id: number) => service.remove(id))
}

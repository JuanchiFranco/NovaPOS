import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import type { ClientesService } from './clientes.service'
import type { ClienteCreateInput, ClienteListParams, ClienteUpdateInput } from '@shared/types/requests'

export function registerClientesIpc(service: ClientesService): void {
  handle(IPC.clientes.list, (params: ClienteListParams) => service.list(params ?? {}))
  handle(IPC.clientes.getById, (id: number) => service.getById(id))
  handle(IPC.clientes.create, (input: ClienteCreateInput) => service.create(input))
  handle(IPC.clientes.update, (id: number, input: ClienteUpdateInput) => service.update(id, input))
  handle(IPC.clientes.remove, (id: number) => service.remove(id))
}

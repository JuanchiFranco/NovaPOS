import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import type { UsuariosService } from './usuarios.service'
import type { UsuarioCreateInput, UsuarioUpdateInput } from '@shared/types/requests'

export function registerUsuariosIpc(service: UsuariosService): void {
  handle(IPC.usuarios.list, () => service.list())
  handle(IPC.usuarios.roles, () => service.roles())
  handle(IPC.usuarios.create, (input: UsuarioCreateInput) => service.create(input))
  handle(IPC.usuarios.update, (id: number, input: UsuarioUpdateInput) => service.update(id, input))
  handle(IPC.usuarios.remove, (id: number) => service.remove(id))
}

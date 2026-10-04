import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import type { RolesService } from './roles.service'
import type { RolCreateInput, RolUpdateInput } from '@shared/types/requests'

/** Los roles definen qué puede hacer cada usuario: solo el Administrador puede crearlos o cambiarlos. */
export function registerRolesIpc(service: RolesService): void {
  handle(IPC.roles.list, () => service.list(), 'usuarios.gestionar')
  handle(IPC.roles.create, (input: RolCreateInput) => service.create(input), 'admin')
  handle(IPC.roles.update, (id: number, input: RolUpdateInput) => service.update(id, input), 'admin')
  handle(IPC.roles.remove, (id: number) => service.remove(id), 'admin')
}

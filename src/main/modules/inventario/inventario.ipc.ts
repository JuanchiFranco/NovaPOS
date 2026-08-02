import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import type { InventarioService } from './inventario.service'
import type { AjusteInventarioInput, MovimientoInventarioListParams } from '@shared/types/requests'

export function registerInventarioIpc(service: InventarioService): void {
  handle(IPC.inventario.movimientos, (params: MovimientoInventarioListParams) => service.list(params ?? {}))
  handle(IPC.inventario.ajustar, (input: AjusteInventarioInput) => service.registrarMovimiento(input))
}

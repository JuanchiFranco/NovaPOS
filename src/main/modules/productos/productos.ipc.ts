import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import type { ProductosService } from './productos.service'
import type { ProductoCreateInput, ProductoListParams, ProductoUpdateInput } from '@shared/types/requests'

export function registerProductosIpc(service: ProductosService): void {
  handle(IPC.productos.list, (params: ProductoListParams) => service.list(params ?? {}))
  handle(IPC.productos.getById, (id: number) => service.getById(id))
  handle(IPC.productos.create, (input: ProductoCreateInput) => service.create(input))
  handle(IPC.productos.update, (id: number, input: ProductoUpdateInput) => service.update(id, input))
  handle(IPC.productos.remove, (id: number) => service.remove(id))
  handle(IPC.productos.lowStock, () => service.lowStock())
  handle(IPC.productos.categorias, () => service.categorias())
}

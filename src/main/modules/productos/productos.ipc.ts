import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import type { ProductosService } from './productos.service'
import type { ProductoCreateInput, ProductoListParams, ProductoUpdateInput } from '@shared/types/requests'

export function registerProductosIpc(service: ProductosService): void {
  handle(IPC.productos.list, (params: ProductoListParams) => service.list(params ?? {}))
  handle(IPC.productos.getById, (id: number) => service.getById(id))
  handle(IPC.productos.create, (input: ProductoCreateInput) => service.create(input), 'productos.editar')
  handle(IPC.productos.update, (id: number, input: ProductoUpdateInput) => service.update(id, input), 'productos.editar')
  handle(IPC.productos.remove, (id: number) => service.remove(id), 'productos.eliminar')
  handle(IPC.productos.lowStock, () => service.lowStock())
  handle(IPC.productos.categorias, () => service.categorias())
}

import type { MovimientoInventarioDTO, PaginatedResult, TipoMovimiento } from '@shared/types/dto'
import type { AjusteInventarioInput, MovimientoInventarioListParams } from '@shared/types/requests'
import { movimientoInventarioSchema } from '@shared/schemas/inventario.schema'
import type { InventarioRepository, MovimientoConProducto } from './inventario.repository'

function toDTO(movimiento: MovimientoConProducto): MovimientoInventarioDTO {
  return {
    id: movimiento.id,
    productoId: movimiento.productoId,
    productoNombre: movimiento.producto.nombre,
    productoCodigo: movimiento.producto.codigo,
    tipo: movimiento.tipo as TipoMovimiento,
    cantidad: movimiento.cantidad,
    stockAnterior: movimiento.stockAnterior,
    stockNuevo: movimiento.stockNuevo,
    motivo: movimiento.motivo,
    ventaId: movimiento.ventaId,
    createdAt: movimiento.createdAt.toISOString()
  }
}

export class InventarioService {
  constructor(private readonly repo: InventarioRepository) {}

  async list(params: MovimientoInventarioListParams): Promise<PaginatedResult<MovimientoInventarioDTO>> {
    const result = await this.repo.findMany(params)
    return { ...result, data: result.data.map(toDTO) }
  }

  async registrarMovimiento(input: AjusteInventarioInput): Promise<MovimientoInventarioDTO> {
    const parsed = movimientoInventarioSchema.parse(input)
    const movimiento = await this.repo.registrarMovimiento(parsed)
    return toDTO(movimiento)
  }
}

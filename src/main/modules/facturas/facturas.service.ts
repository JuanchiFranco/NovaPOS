import type { EstadoFactura, FacturaDTO, MetodoPago, PaginatedResult } from '@shared/types/dto'
import type { FacturaListParams } from '@shared/types/requests'
import { NotFoundError } from '../../shared/errors'
import type { FacturasRepository, FacturaConDetalle } from './facturas.repository'

function toDTO(factura: FacturaConDetalle): FacturaDTO {
  return {
    id: factura.id,
    numero: factura.numero,
    consecutivo: factura.consecutivo,
    ventaId: factura.ventaId,
    cliente: factura.cliente
      ? {
          id: factura.cliente.id,
          nombre: factura.cliente.nombre,
          telefono: factura.cliente.telefono,
          direccion: factura.cliente.direccion
        }
      : null,
    subtotal: factura.subtotal,
    descuento: factura.descuento,
    iva: factura.iva,
    total: factura.total,
    metodoPago: factura.metodoPago as MetodoPago,
    estado: factura.estado as EstadoFactura,
    detalle: factura.detalle.map((d) => ({
      id: d.id,
      productoNombre: d.productoNombre,
      productoCodigo: d.productoCodigo,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      descuento: d.descuento,
      subtotal: d.subtotal
    })),
    fechaEmision: factura.fechaEmision.toISOString()
  }
}

export class FacturasService {
  constructor(private readonly repo: FacturasRepository) {}

  async list(params: FacturaListParams): Promise<PaginatedResult<FacturaDTO>> {
    const result = await this.repo.findMany(params)
    return { ...result, data: result.data.map(toDTO) }
  }

  async getById(id: number): Promise<FacturaDTO> {
    const factura = await this.repo.findById(id)
    if (!factura) throw new NotFoundError('Factura', id)
    return toDTO(factura)
  }

  async getByVentaId(ventaId: number): Promise<FacturaDTO> {
    const factura = await this.repo.findByVentaId(ventaId)
    if (!factura) throw new NotFoundError('Factura de la venta', ventaId)
    return toDTO(factura)
  }
}

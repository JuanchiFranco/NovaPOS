import type { FacturaCompraDTO, MetodoPagoCompra, PaginatedResult } from '@shared/types/dto'
import type { FacturaCompraCreateInput, FacturaCompraListParams } from '@shared/types/requests'
import { facturaCompraSchema } from '@shared/schemas/facturaCompra.schema'
import { NotFoundError } from '../../shared/errors'
import type { ComprasRepository, FacturaCompraConDetalle } from './compras.repository'

function toDTO(factura: FacturaCompraConDetalle): FacturaCompraDTO {
  return {
    id: factura.id,
    proveedorNombre: factura.proveedorNombre,
    numeroFactura: factura.numeroFactura,
    fecha: factura.fecha.toISOString(),
    metodoPago: factura.metodoPago as MetodoPagoCompra | null,
    total: factura.total,
    notas: factura.notas,
    detalle: factura.detalle.map((d) => ({
      id: d.id,
      descripcion: d.descripcion,
      cantidad: d.cantidad,
      valorUnitario: d.valorUnitario,
      subtotal: d.subtotal
    })),
    createdAt: factura.createdAt.toISOString()
  }
}

export class ComprasService {
  constructor(private readonly repo: ComprasRepository) {}

  async list(params: FacturaCompraListParams): Promise<PaginatedResult<FacturaCompraDTO>> {
    const result = await this.repo.findMany(params)
    return { ...result, data: result.data.map(toDTO) }
  }

  async getById(id: number): Promise<FacturaCompraDTO> {
    const factura = await this.repo.findById(id)
    if (!factura) throw new NotFoundError('Factura de compra', id)
    return toDTO(factura)
  }

  async create(input: FacturaCompraCreateInput): Promise<FacturaCompraDTO> {
    const parsed = facturaCompraSchema.parse(input)
    const items = parsed.items.map((item) => ({
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      valorUnitario: item.valorUnitario,
      subtotal: Number((item.cantidad * item.valorUnitario).toFixed(2))
    }))
    const total = Number(items.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2))

    const created = await this.repo.create({
      proveedorNombre: parsed.proveedorNombre,
      numeroFactura: parsed.numeroFactura,
      fecha: parsed.fecha,
      metodoPago: parsed.metodoPago,
      notas: parsed.notas,
      total,
      items
    })
    return toDTO(created)
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }
}

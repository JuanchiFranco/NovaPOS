import type { EstadoVenta, MetodoPago, PaginatedResult, VentaDTO } from '@shared/types/dto'
import type { VentaCreateInput, VentaListParams } from '@shared/types/requests'
import { ventaSchema } from '@shared/schemas/venta.schema'
import { NotFoundError, ValidationError } from '../../shared/errors'
import type { VentasRepository, VentaConDetalle } from './ventas.repository'

function toDTO(venta: VentaConDetalle): VentaDTO {
  return {
    id: venta.id,
    clienteId: venta.clienteId,
    clienteNombre: venta.cliente?.nombre ?? null,
    subtotal: venta.subtotal,
    descuento: venta.descuento,
    iva: venta.iva,
    total: venta.total,
    metodoPago: venta.metodoPago as MetodoPago,
    montoEfectivo: venta.montoEfectivo,
    montoTarjeta: venta.montoTarjeta,
    montoTransferencia: venta.montoTransferencia,
    estado: venta.estado as EstadoVenta,
    notas: venta.notas,
    facturaNumero: venta.factura?.numero ?? null,
    detalle: venta.detalle.map((d) => ({
      id: d.id,
      productoId: d.productoId,
      productoNombre: d.producto.nombre,
      productoCodigo: d.producto.codigo,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      descuento: d.descuento,
      subtotal: d.subtotal
    })),
    createdAt: venta.createdAt.toISOString()
  }
}

export class VentasService {
  constructor(private readonly repo: VentasRepository) {}

  async list(params: VentaListParams): Promise<PaginatedResult<VentaDTO>> {
    const result = await this.repo.findMany(params)
    return { ...result, data: result.data.map(toDTO) }
  }

  async getById(id: number): Promise<VentaDTO> {
    const venta = await this.repo.findById(id)
    if (!venta) throw new NotFoundError('Venta', id)
    return toDTO(venta)
  }

  async create(input: VentaCreateInput): Promise<VentaDTO> {
    const parsed = ventaSchema.parse(input)

    const productoIds = [...new Set(parsed.items.map((i) => i.productoId))]
    const productos = await this.repo.findProductosByIds(productoIds)
    const productosPorId = new Map(productos.map((p) => [p.id, p]))

    for (const item of parsed.items) {
      const producto = productosPorId.get(item.productoId)
      if (!producto) throw new NotFoundError('Producto', item.productoId)
      if (!producto.activo) throw new ValidationError(`El producto "${producto.nombre}" está inactivo.`)
    }

    const items = parsed.items.map((item) => ({
      productoId: item.productoId,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      descuento: item.descuento,
      subtotal: Math.max(0, item.precioUnitario * item.cantidad - item.descuento)
    }))

    const subtotalBruto = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
    const descuentoItems = items.reduce((acc, i) => acc + i.descuento, 0)
    const descuentoGlobal = parsed.descuentoGlobal
    const descuentoTotal = descuentoItems + descuentoGlobal
    const baseImponible = Math.max(0, subtotalBruto - descuentoTotal)

    // No se cobra IVA: el total es la base imponible sin recargo.
    const iva = 0
    const total = Number(baseImponible.toFixed(2))

    const venta = await this.repo.createVentaConFactura({
      clienteId: parsed.clienteId ?? null,
      usuarioId: null,
      subtotal: Number(subtotalBruto.toFixed(2)),
      descuento: Number(descuentoTotal.toFixed(2)),
      iva,
      total,
      metodoPago: parsed.metodoPago,
      montoEfectivo: parsed.montoEfectivo,
      montoTarjeta: parsed.montoTarjeta,
      montoTransferencia: parsed.montoTransferencia,
      notas: parsed.notas,
      items
    })

    return toDTO(venta)
  }

  async anular(id: number): Promise<VentaDTO> {
    const venta = await this.repo.anular(id)
    return toDTO(venta)
  }
}

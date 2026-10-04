import type { EstadoVenta, MetodoPago, PaginatedResult, VentaDTO } from '@shared/types/dto'
import type { VentaCreateInput, VentaListParams } from '@shared/types/requests'
import { ventaSchema } from '@shared/schemas/venta.schema'
import { NotFoundError, ValidationError } from '../../shared/errors'
import { getSessionUserId } from '../auth/session'
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

const TOLERANCIA_MONTO = 0.005

function redondear(valor: number): number {
  return Number(valor.toFixed(2))
}

function igualesMonto(a: number, b: number): boolean {
  return Math.abs(a - b) < TOLERANCIA_MONTO
}

/** IVA contenido en un total que ya lo incluye. */
export function calcularIvaIncluido(total: number, porcentajeIva: number): number {
  if (porcentajeIva <= 0) return 0
  return redondear(total - total / (1 + porcentajeIva / 100))
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

    // El precio NUNCA se toma de lo que envía la interfaz: debe coincidir con el precio vigente
    // del producto en la base de datos (detal o mayorista). Así un cliente IPC manipulado no puede
    // vender por debajo del precio configurado.
    const items = parsed.items.map((item) => {
      const producto = productosPorId.get(item.productoId)!
      const esPrecioDetal = igualesMonto(item.precioUnitario, producto.precioVenta)
      const esPrecioMayorista = producto.precioMayorista != null && igualesMonto(item.precioUnitario, producto.precioMayorista)
      if (!esPrecioDetal && !esPrecioMayorista) {
        throw new ValidationError(
          `El precio de "${producto.nombre}" cambió o no es válido. Actualiza el carrito e inténtalo de nuevo.`
        )
      }
      const bruto = item.precioUnitario * item.cantidad
      if (item.descuento > bruto) {
        throw new ValidationError(`El descuento de "${producto.nombre}" no puede superar el valor de la línea.`)
      }
      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        descuento: item.descuento,
        subtotal: Math.max(0, bruto - item.descuento)
      }
    })

    const subtotalBruto = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
    const descuentoItems = items.reduce((acc, i) => acc + i.descuento, 0)
    const descuentoGlobal = parsed.descuentoGlobal
    if (descuentoGlobal > subtotalBruto - descuentoItems) {
      throw new ValidationError('El descuento global no puede superar el total de la venta.')
    }
    const descuentoTotal = descuentoItems + descuentoGlobal
    const baseImponible = Math.max(0, subtotalBruto - descuentoTotal)

    // Los precios ya incluyen IVA: el total no cambia, el IVA se desglosa según el % configurado
    // (con 0 % no se discrimina IVA).
    const porcentajeIva = await this.repo.getPorcentajeIva()
    const total = redondear(baseImponible)
    const iva = calcularIvaIncluido(total, porcentajeIva)

    if (parsed.metodoPago === 'MIXTO') {
      const pagado = (parsed.montoEfectivo ?? 0) + (parsed.montoTarjeta ?? 0) + (parsed.montoTransferencia ?? 0)
      if (pagado + 0.01 < total) {
        throw new ValidationError('La suma de los pagos mixtos es menor al total de la venta.')
      }
    }

    const venta = await this.repo.createVentaConFactura({
      clienteId: parsed.clienteId ?? null,
      usuarioId: getSessionUserId(),
      subtotal: redondear(subtotalBruto),
      descuento: redondear(descuentoTotal),
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

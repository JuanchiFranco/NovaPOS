import type { DashboardResumenDTO, EstadoVenta, MetodoPago, VentaDTO } from '@shared/types/dto'
import type { DashboardRepository } from './dashboard.repository'
import { toProductoDTO } from '../productos/productos.service'
import type { Prisma } from '@prisma/client'

const ventaInclude = {
  cliente: true,
  detalle: { include: { producto: true } },
  factura: true
} satisfies Prisma.VentaInclude

function toVentaDTO(venta: Prisma.VentaGetPayload<{ include: typeof ventaInclude }>): VentaDTO {
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

export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  async resumen(): Promise<DashboardResumenDTO> {
    const [ventasHoy, ventasMes, totalFacturado, masVendidos, ultimasVentas, bajoStockIds, ventasPorDia] =
      await Promise.all([
        this.repo.ventasHoy(),
        this.repo.ventasMes(),
        this.repo.totalFacturado(),
        this.repo.productosMasVendidos(5),
        this.repo.ultimasVentas(8),
        this.repo.productosBajoStock(),
        this.repo.ventasPorDia(14)
      ])

    const productosBajoStock = await this.repo.productosBajoStockDetalle(bajoStockIds.map((r) => r.id))

    return {
      ventasHoy: { total: ventasHoy._sum.total ?? 0, cantidad: ventasHoy._count.id },
      ventasMes: { total: ventasMes._sum.total ?? 0, cantidad: ventasMes._count.id },
      totalFacturado,
      productosMasVendidos: masVendidos,
      ultimasVentas: ultimasVentas.map(toVentaDTO),
      productosBajoStock: productosBajoStock.map(toProductoDTO),
      ventasPorDia: ventasPorDia.map((v) => ({ fecha: v.fecha, total: v.total }))
    }
  }
}

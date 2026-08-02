import type { Prisma, PrismaClient } from '@prisma/client'
import type { ReporteComprasParams, ReporteVentasParams } from '@shared/types/requests'
import { endOfDay } from './reportes.helpers'

const detalleVentaInclude = {
  venta: { include: { cliente: true } },
  producto: { include: { categoria: true } }
} satisfies Prisma.DetalleVentaInclude

export type DetalleVentaConRelaciones = Prisma.DetalleVentaGetPayload<{ include: typeof detalleVentaInclude }>

export class ReportesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findDetalleVentas(params: ReporteVentasParams): Promise<DetalleVentaConRelaciones[]> {
    const ventaWhere: Prisma.VentaWhereInput = {
      estado: 'COMPLETADA',
      ...(params.clienteId ? { clienteId: params.clienteId } : {}),
      ...(params.metodoPago ? { metodoPago: params.metodoPago } : {}),
      ...(params.desde || params.hasta
        ? {
            createdAt: {
              ...(params.desde ? { gte: new Date(params.desde) } : {}),
              ...(params.hasta ? { lte: endOfDay(params.hasta) } : {})
            }
          }
        : {})
    }

    return this.prisma.detalleVenta.findMany({
      where: {
        venta: ventaWhere,
        ...(params.productoId ? { productoId: params.productoId } : {}),
        ...(params.categoriaId ? { producto: { categoriaId: params.categoriaId } } : {})
      },
      include: detalleVentaInclude,
      orderBy: { venta: { createdAt: 'asc' } }
    })
  }

  findFacturasCompra(params: ReporteComprasParams) {
    return this.prisma.facturaCompra.findMany({
      where: {
        ...(params.proveedorNombre ? { proveedorNombre: { contains: params.proveedorNombre } } : {}),
        ...(params.desde || params.hasta
          ? {
              fecha: {
                ...(params.desde ? { gte: new Date(params.desde) } : {}),
                ...(params.hasta ? { lte: endOfDay(params.hasta) } : {})
              }
            }
          : {})
      },
      orderBy: { fecha: 'asc' }
    })
  }
}

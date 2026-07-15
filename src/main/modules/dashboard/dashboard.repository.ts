import type { PrismaClient } from '@prisma/client'

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export class DashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async ventasEntreFechas(desde: Date, hasta: Date) {
    return this.prisma.venta.aggregate({
      where: { createdAt: { gte: desde, lte: hasta }, estado: 'COMPLETADA' },
      _sum: { total: true },
      _count: { id: true }
    })
  }

  ventasHoy() {
    const hoy = startOfDay(new Date())
    const finHoy = new Date(hoy.getTime() + 24 * 60 * 60 * 1000 - 1)
    return this.ventasEntreFechas(hoy, finHoy)
  }

  ventasMes() {
    const inicioMes = startOfMonth(new Date())
    return this.ventasEntreFechas(inicioMes, new Date())
  }

  async totalFacturado() {
    const result = await this.prisma.factura.aggregate({
      where: { estado: 'EMITIDA' },
      _sum: { total: true }
    })
    return result._sum.total ?? 0
  }

  async productosMasVendidos(limit: number) {
    const grouped = await this.prisma.detalleVenta.groupBy({
      by: ['productoId'],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: limit
    })
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: grouped.map((g) => g.productoId) } }
    })
    const nombreMap = new Map(productos.map((p) => [p.id, p.nombre]))
    return grouped.map((g) => ({
      productoId: g.productoId,
      nombre: nombreMap.get(g.productoId) ?? 'Producto eliminado',
      cantidad: g._sum.cantidad ?? 0
    }))
  }

  ultimasVentas(limit: number) {
    return this.prisma.venta.findMany({
      include: { cliente: true, detalle: { include: { producto: true } }, factura: true },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  productosBajoStock() {
    return this.prisma.$queryRaw<
      { id: number }[]
    >`SELECT id FROM productos WHERE activo = 1 AND stock <= stockMinimo`
  }

  async productosBajoStockDetalle(ids: number[]) {
    return this.prisma.producto.findMany({ where: { id: { in: ids } }, include: { categoria: true } })
  }

  async comprasMes() {
    const inicioMes = startOfMonth(new Date())
    const result = await this.prisma.facturaCompra.aggregate({
      where: { fecha: { gte: inicioMes, lte: new Date() } },
      _sum: { total: true },
      _count: { id: true }
    })
    return { total: result._sum.total ?? 0, cantidad: result._count.id }
  }

  ultimasCompras(limit: number) {
    return this.prisma.facturaCompra.findMany({
      include: { detalle: true },
      orderBy: { fecha: 'desc' },
      take: limit
    })
  }

  async ventasPorDia(dias: number) {
    const desde = startOfDay(new Date(Date.now() - dias * 24 * 60 * 60 * 1000))
    // Prisma guarda los DateTime de SQLite como enteros (ms desde epoch), no como texto ISO;
    // hay que comparar contra ese mismo formato y usar el modificador 'unixepoch' para parsear.
    return this.prisma.$queryRaw<
      { fecha: string; total: number }[]
    >`SELECT date(createdAt / 1000, 'unixepoch') as fecha, SUM(total) as total
      FROM ventas
      WHERE createdAt >= ${desde.getTime()} AND estado = 'COMPLETADA'
      GROUP BY date(createdAt / 1000, 'unixepoch')
      ORDER BY fecha ASC`
  }
}

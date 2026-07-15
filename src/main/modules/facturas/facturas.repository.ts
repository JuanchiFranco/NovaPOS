import type { Prisma, PrismaClient } from '@prisma/client'
import type { FacturaListParams } from '@shared/types/requests'

const facturaInclude = {
  cliente: true,
  detalle: true
} satisfies Prisma.FacturaInclude

export type FacturaConDetalle = Prisma.FacturaGetPayload<{ include: typeof facturaInclude }>

export class FacturasRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(params: FacturaListParams) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const where: Prisma.FacturaWhereInput = {
      ...(params.clienteId ? { clienteId: params.clienteId } : {}),
      ...(params.numero ? { numero: { contains: params.numero } } : {}),
      ...(params.metodoPago ? { metodoPago: params.metodoPago } : {}),
      ...(params.productoNombre
        ? { detalle: { some: { productoNombre: { contains: params.productoNombre } } } }
        : {}),
      ...(params.desde || params.hasta
        ? {
            fechaEmision: {
              ...(params.desde ? { gte: new Date(params.desde) } : {}),
              ...(params.hasta ? { lte: new Date(params.hasta) } : {})
            }
          }
        : {})
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.factura.findMany({
        where,
        include: facturaInclude,
        orderBy: { fechaEmision: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.factura.count({ where })
    ])

    return { data, total, page, pageSize }
  }

  findById(id: number) {
    return this.prisma.factura.findUnique({ where: { id }, include: facturaInclude })
  }

  findByVentaId(ventaId: number) {
    return this.prisma.factura.findUnique({ where: { ventaId }, include: facturaInclude })
  }
}

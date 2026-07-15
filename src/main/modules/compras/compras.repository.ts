import type { Prisma, PrismaClient } from '@prisma/client'
import type { FacturaCompraListParams } from '@shared/types/requests'

const facturaCompraInclude = {
  detalle: true
} satisfies Prisma.FacturaCompraInclude

export type FacturaCompraConDetalle = Prisma.FacturaCompraGetPayload<{ include: typeof facturaCompraInclude }>

export interface CreateFacturaCompraInput {
  proveedorNombre: string
  numeroFactura?: string
  fecha?: string
  metodoPago?: string
  notas?: string
  total: number
  items: { descripcion: string; cantidad: number; valorUnitario: number; subtotal: number }[]
}

export class ComprasRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(params: FacturaCompraListParams) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const where: Prisma.FacturaCompraWhereInput = {
      ...(params.proveedorNombre ? { proveedorNombre: { contains: params.proveedorNombre } } : {}),
      ...(params.desde || params.hasta
        ? {
            fecha: {
              ...(params.desde ? { gte: new Date(params.desde) } : {}),
              ...(params.hasta ? { lte: new Date(params.hasta) } : {})
            }
          }
        : {})
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.facturaCompra.findMany({
        where,
        include: facturaCompraInclude,
        orderBy: { fecha: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.facturaCompra.count({ where })
    ])

    return { data, total, page, pageSize }
  }

  findById(id: number) {
    return this.prisma.facturaCompra.findUnique({ where: { id }, include: facturaCompraInclude })
  }

  create(input: CreateFacturaCompraInput) {
    return this.prisma.facturaCompra.create({
      data: {
        proveedorNombre: input.proveedorNombre,
        numeroFactura: input.numeroFactura,
        fecha: input.fecha ? new Date(input.fecha) : undefined,
        metodoPago: input.metodoPago,
        total: input.total,
        notas: input.notas,
        detalle: { create: input.items }
      },
      include: facturaCompraInclude
    })
  }

  async remove(id: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.detalleCompra.deleteMany({ where: { facturaCompraId: id } }),
      this.prisma.facturaCompra.delete({ where: { id } })
    ])
  }
}

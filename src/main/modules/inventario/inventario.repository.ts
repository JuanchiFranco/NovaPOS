import type { Prisma, PrismaClient } from '@prisma/client'
import type { MovimientoInventarioListParams } from '@shared/types/requests'
import { ConflictError, NotFoundError } from '../../shared/errors'

export interface RegistrarMovimientoInput {
  productoId: number
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE'
  cantidad: number
  motivo: string
}

const movimientoInclude = { producto: true } satisfies Prisma.MovimientoInventarioInclude

export type MovimientoConProducto = Prisma.MovimientoInventarioGetPayload<{
  include: typeof movimientoInclude
}>

export class InventarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(params: MovimientoInventarioListParams) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20

    const where: Prisma.MovimientoInventarioWhereInput = {
      ...(params.productoId ? { productoId: params.productoId } : {}),
      ...(params.tipo ? { tipo: params.tipo } : {}),
      ...(params.desde || params.hasta
        ? {
            createdAt: {
              ...(params.desde ? { gte: new Date(params.desde) } : {}),
              ...(params.hasta ? { lte: new Date(params.hasta) } : {})
            }
          }
        : {})
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.movimientoInventario.findMany({
        where,
        include: movimientoInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.movimientoInventario.count({ where })
    ])

    return { data, total, page, pageSize }
  }

  /** Registra un movimiento manual (entrada, salida o ajuste) y actualiza el stock del producto en una transacción. */
  async registrarMovimiento(input: RegistrarMovimientoInput): Promise<MovimientoConProducto> {
    const movimientoId = await this.prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({ where: { id: input.productoId } })
      if (!producto) throw new NotFoundError('Producto', input.productoId)

      let stockNuevo: number
      let cantidadMovimiento: number

      if (input.tipo === 'ENTRADA') {
        stockNuevo = producto.stock + input.cantidad
        cantidadMovimiento = input.cantidad
      } else if (input.tipo === 'SALIDA') {
        stockNuevo = producto.stock - input.cantidad
        if (stockNuevo < 0) {
          throw new ConflictError(`Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock})`)
        }
        cantidadMovimiento = input.cantidad
      } else {
        // AJUSTE: `cantidad` es el nuevo stock absoluto (ej. tras un conteo físico).
        stockNuevo = input.cantidad
        cantidadMovimiento = Math.abs(stockNuevo - producto.stock)
      }

      await tx.producto.update({ where: { id: producto.id }, data: { stock: stockNuevo } })

      const movimiento = await tx.movimientoInventario.create({
        data: {
          productoId: producto.id,
          tipo: input.tipo,
          cantidad: cantidadMovimiento,
          stockAnterior: producto.stock,
          stockNuevo,
          motivo: input.motivo
        }
      })

      return movimiento.id
    })

    const movimiento = await this.prisma.movimientoInventario.findUnique({
      where: { id: movimientoId },
      include: movimientoInclude
    })
    if (!movimiento) throw new NotFoundError('Movimiento de inventario', movimientoId)
    return movimiento
  }
}

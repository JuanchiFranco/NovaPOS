import type { Prisma, PrismaClient } from '@prisma/client'
import type { MetodoPago } from '@shared/types/dto'
import { ConflictError, NotFoundError } from '../../shared/errors'

export interface CreateVentaTransactionInput {
  clienteId: number | null
  usuarioId: number | null
  subtotal: number
  descuento: number
  iva: number
  total: number
  metodoPago: MetodoPago
  montoEfectivo?: number
  montoTarjeta?: number
  montoTransferencia?: number
  notas?: string
  items: { productoId: number; cantidad: number; precioUnitario: number; descuento: number; subtotal: number }[]
}

const ventaInclude = {
  cliente: true,
  detalle: { include: { producto: true } },
  factura: true
} satisfies Prisma.VentaInclude

export type VentaConDetalle = Prisma.VentaGetPayload<{ include: typeof ventaInclude }>

export class VentasRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findProductosByIds(ids: number[]) {
    return this.prisma.producto.findMany({ where: { id: { in: ids } } })
  }

  async findMany(params: { desde?: string; hasta?: string; clienteId?: number; page?: number; pageSize?: number }) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const where: Prisma.VentaWhereInput = {
      ...(params.clienteId ? { clienteId: params.clienteId } : {}),
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
      this.prisma.venta.findMany({
        where,
        include: ventaInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.venta.count({ where })
    ])

    return { data, total, page, pageSize }
  }

  findById(id: number) {
    return this.prisma.venta.findUnique({ where: { id }, include: ventaInclude })
  }

  async createVentaConFactura(input: CreateVentaTransactionInput): Promise<VentaConDetalle> {
    const ventaId = await this.prisma.$transaction(async (tx) => {
      const venta = await tx.venta.create({
        data: {
          clienteId: input.clienteId,
          usuarioId: input.usuarioId,
          subtotal: input.subtotal,
          descuento: input.descuento,
          iva: input.iva,
          total: input.total,
          metodoPago: input.metodoPago,
          montoEfectivo: input.montoEfectivo,
          montoTarjeta: input.montoTarjeta,
          montoTransferencia: input.montoTransferencia,
          notas: input.notas
        }
      })

      const detalleFacturaData: Prisma.DetalleFacturaCreateManyFacturaInput[] = []

      for (const item of input.items) {
        const producto = await tx.producto.findUnique({ where: { id: item.productoId } })
        if (!producto) throw new NotFoundError('Producto', item.productoId)

        const stockNuevo = producto.stock - item.cantidad
        if (stockNuevo < 0) {
          throw new ConflictError(`Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock})`)
        }

        await tx.detalleVenta.create({
          data: {
            ventaId: venta.id,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            descuento: item.descuento,
            subtotal: item.subtotal
          }
        })

        await tx.producto.update({ where: { id: item.productoId }, data: { stock: stockNuevo } })

        await tx.movimientoInventario.create({
          data: {
            productoId: item.productoId,
            tipo: 'SALIDA',
            cantidad: item.cantidad,
            stockAnterior: producto.stock,
            stockNuevo,
            motivo: 'Venta',
            ventaId: venta.id
          }
        })

        detalleFacturaData.push({
          productoNombre: producto.nombre,
          productoCodigo: producto.codigo,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          descuento: item.descuento,
          subtotal: item.subtotal
        })
      }

      const config = await tx.configuracion.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} })
      const consecutivo = config.siguienteNumeroFactura
      const numero = `${config.prefijoFactura}-${String(consecutivo).padStart(6, '0')}`

      await tx.factura.create({
        data: {
          numero,
          consecutivo,
          ventaId: venta.id,
          clienteId: input.clienteId,
          subtotal: input.subtotal,
          descuento: input.descuento,
          iva: input.iva,
          total: input.total,
          metodoPago: input.metodoPago,
          detalle: { createMany: { data: detalleFacturaData } }
        }
      })

      await tx.configuracion.update({ where: { id: 1 }, data: { siguienteNumeroFactura: consecutivo + 1 } })

      return venta.id
    })

    const venta = await this.findById(ventaId)
    if (!venta) throw new NotFoundError('Venta', ventaId)
    return venta
  }

  async anular(id: number): Promise<VentaConDetalle> {
    await this.prisma.$transaction(async (tx) => {
      const venta = await tx.venta.findUnique({ where: { id }, include: { detalle: true } })
      if (!venta) throw new NotFoundError('Venta', id)
      if (venta.estado === 'ANULADA') throw new ConflictError('La venta ya se encuentra anulada.')

      for (const item of venta.detalle) {
        const producto = await tx.producto.findUnique({ where: { id: item.productoId } })
        if (!producto) continue
        const stockNuevo = producto.stock + item.cantidad
        await tx.producto.update({ where: { id: producto.id }, data: { stock: stockNuevo } })
        await tx.movimientoInventario.create({
          data: {
            productoId: producto.id,
            tipo: 'ENTRADA',
            cantidad: item.cantidad,
            stockAnterior: producto.stock,
            stockNuevo,
            motivo: 'Anulación de venta',
            ventaId: id
          }
        })
      }

      await tx.venta.update({ where: { id }, data: { estado: 'ANULADA' } })
      await tx.factura.update({ where: { ventaId: id }, data: { estado: 'ANULADA' } }).catch(() => undefined)
    })

    const venta = await this.findById(id)
    if (!venta) throw new NotFoundError('Venta', id)
    return venta
  }
}

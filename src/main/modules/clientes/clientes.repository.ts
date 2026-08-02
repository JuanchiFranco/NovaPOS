import type { Prisma, PrismaClient } from '@prisma/client'
import type { ClienteCreateInput, ClienteListParams, ClienteUpdateInput } from '@shared/types/requests'
import { registrarAuditoria } from '../auditoria/audit-logger'

export class ClientesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(params: ClienteListParams) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const where: Prisma.ClienteWhereInput = params.search
      ? {
          OR: [{ nombre: { contains: params.search } }, { telefono: { contains: params.search } }]
        }
      : {}

    const [data, total] = await this.prisma.$transaction([
      this.prisma.cliente.findMany({
        where,
        orderBy: { nombre: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.cliente.count({ where })
    ])

    return { data, total, page, pageSize }
  }

  findById(id: number) {
    return this.prisma.cliente.findUnique({ where: { id } })
  }

  async create(input: ClienteCreateInput) {
    const cliente = await this.prisma.cliente.create({ data: input })
    await registrarAuditoria(this.prisma, 'cliente', cliente.id, 'CREATE', { nombre: cliente.nombre })
    return cliente
  }

  async update(id: number, input: ClienteUpdateInput) {
    const cliente = await this.prisma.cliente.update({ where: { id }, data: input })
    await registrarAuditoria(this.prisma, 'cliente', cliente.id, 'UPDATE', { nombre: cliente.nombre })
    return cliente
  }

  /** Baja lógica: nunca se elimina físicamente si tiene ventas asociadas. */
  async remove(id: number) {
    const ventasCount = await this.prisma.venta.count({ where: { clienteId: id } })
    if (ventasCount > 0) {
      const cliente = await this.prisma.cliente.update({ where: { id }, data: { activo: false } })
      await registrarAuditoria(this.prisma, 'cliente', id, 'UPDATE', { accion: 'desactivado' })
      return cliente
    }
    const cliente = await this.prisma.cliente.delete({ where: { id } })
    await registrarAuditoria(this.prisma, 'cliente', id, 'DELETE', { nombre: cliente.nombre })
    return cliente
  }
}

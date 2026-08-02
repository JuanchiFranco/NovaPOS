import type { Prisma, PrismaClient } from '@prisma/client'
import type { AuditoriaListParams } from '@shared/types/requests'

const auditoriaInclude = { usuario: true } satisfies Prisma.AuditoriaInclude
export type AuditoriaConUsuario = Prisma.AuditoriaGetPayload<{ include: typeof auditoriaInclude }>

function endOfDay(dateStr: string): Date {
  const date = new Date(dateStr)
  date.setHours(23, 59, 59, 999)
  return date
}

export class AuditoriaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(params: AuditoriaListParams) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20

    const where: Prisma.AuditoriaWhereInput = {
      ...(params.entidad ? { entidad: params.entidad } : {}),
      ...(params.accion ? { accion: params.accion } : {}),
      ...(params.usuarioId ? { usuarioId: params.usuarioId } : {}),
      ...(params.desde || params.hasta
        ? {
            createdAt: {
              ...(params.desde ? { gte: new Date(params.desde) } : {}),
              ...(params.hasta ? { lte: endOfDay(params.hasta) } : {})
            }
          }
        : {})
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditoria.findMany({
        where,
        include: auditoriaInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.auditoria.count({ where })
    ])

    return { data, total, page, pageSize }
  }

  distinctEntidades(): Promise<{ entidad: string }[]> {
    return this.prisma.auditoria.findMany({
      select: { entidad: true },
      distinct: ['entidad'],
      orderBy: { entidad: 'asc' }
    })
  }
}

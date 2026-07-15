import type { PrismaClient } from '@prisma/client'
import type { ConfiguracionUpdateInput } from '@shared/types/requests'

/** Acceso a datos de configuración. Solo existe un registro (id = 1). */
export class ConfiguracionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async get() {
    const config = await this.prisma.configuracion.findUnique({ where: { id: 1 } })
    if (config) return config
    return this.prisma.configuracion.create({ data: { id: 1 } })
  }

  async update(input: ConfiguracionUpdateInput) {
    return this.prisma.configuracion.upsert({
      where: { id: 1 },
      create: { id: 1, ...input },
      update: { ...input }
    })
  }

  async updateLogoPath(logoPath: string) {
    return this.prisma.configuracion.update({ where: { id: 1 }, data: { logoPath } })
  }
}

import type { PrismaClient } from '@prisma/client'
import type { ConfiguracionUpdateInput } from '@shared/types/requests'
import { registrarAuditoria } from '../auditoria/audit-logger'

/** Acceso a datos de configuración. Solo existe un registro (id = 1). */
export class ConfiguracionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async get() {
    const config = await this.prisma.configuracion.findUnique({ where: { id: 1 } })
    if (config) return config
    return this.prisma.configuracion.create({ data: { id: 1 } })
  }

  async update(input: ConfiguracionUpdateInput) {
    const config = await this.prisma.configuracion.upsert({
      where: { id: 1 },
      create: { id: 1, ...input },
      update: { ...input }
    })
    await registrarAuditoria(this.prisma, 'configuracion', config.id, 'UPDATE')
    return config
  }

  async updateLogoPath(logoPath: string) {
    return this.prisma.configuracion.update({ where: { id: 1 }, data: { logoPath } })
  }

  async updateImpresoraPredeterminada(impresoraPredeterminada: string) {
    const config = await this.prisma.configuracion.upsert({
      where: { id: 1 },
      create: { id: 1, impresoraPredeterminada },
      update: { impresoraPredeterminada }
    })
    await registrarAuditoria(this.prisma, 'configuracion', config.id, 'UPDATE', { impresoraPredeterminada })
    return config
  }
}

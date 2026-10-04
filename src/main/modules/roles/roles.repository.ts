import type { PrismaClient } from '@prisma/client'
import { registrarAuditoria } from '../auditoria/audit-logger'

const incluirConteo = { _count: { select: { usuarios: true } } } as const

export class RolesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findMany() {
    return this.prisma.rol.findMany({ orderBy: { nombre: 'asc' }, include: incluirConteo })
  }

  findById(id: number) {
    return this.prisma.rol.findUnique({ where: { id }, include: incluirConteo })
  }

  findByNombre(nombre: string) {
    return this.prisma.rol.findUnique({ where: { nombre } })
  }

  async create(data: { nombre: string; descripcion?: string; permisos: string[] }) {
    const rol = await this.prisma.rol.create({
      data: { nombre: data.nombre, descripcion: data.descripcion, permisos: JSON.stringify(data.permisos) },
      include: incluirConteo
    })
    await registrarAuditoria(this.prisma, 'rol', rol.id, 'CREATE', { nombre: rol.nombre, permisos: data.permisos })
    return rol
  }

  async update(id: number, data: { nombre?: string; descripcion?: string | null; permisos?: string[] }) {
    const rol = await this.prisma.rol.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        permisos: data.permisos ? JSON.stringify(data.permisos) : undefined
      },
      include: incluirConteo
    })
    await registrarAuditoria(this.prisma, 'rol', rol.id, 'UPDATE', { nombre: rol.nombre, permisos: data.permisos })
    return rol
  }

  async remove(id: number, nombre: string): Promise<void> {
    await this.prisma.rol.delete({ where: { id } })
    await registrarAuditoria(this.prisma, 'rol', id, 'DELETE', { nombre })
  }
}

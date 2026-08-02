import type { Prisma, PrismaClient } from '@prisma/client'
import { registrarAuditoria } from '../auditoria/audit-logger'

const usuarioInclude = { rol: true } satisfies Prisma.UsuarioInclude
export type UsuarioConRol = Prisma.UsuarioGetPayload<{ include: typeof usuarioInclude }>

export interface CrearUsuarioInput {
  nombre: string
  usuario: string
  passwordHash: string
  rolId: number
}

export interface ActualizarUsuarioInput {
  nombre?: string
  usuario?: string
  passwordHash?: string
  rolId?: number
  activo?: boolean
}

export class UsuariosRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findMany(): Promise<UsuarioConRol[]> {
    return this.prisma.usuario.findMany({ include: usuarioInclude, orderBy: { nombre: 'asc' } })
  }

  findById(id: number): Promise<UsuarioConRol | null> {
    return this.prisma.usuario.findUnique({ where: { id }, include: usuarioInclude })
  }

  findByUsuario(usuario: string): Promise<UsuarioConRol | null> {
    return this.prisma.usuario.findUnique({ where: { usuario }, include: usuarioInclude })
  }

  async create(input: CrearUsuarioInput): Promise<UsuarioConRol> {
    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: input.nombre,
        usuario: input.usuario,
        passwordHash: input.passwordHash,
        rolId: input.rolId
      },
      include: usuarioInclude
    })
    await registrarAuditoria(this.prisma, 'usuario', usuario.id, 'CREATE', { usuario: usuario.usuario, rol: usuario.rol.nombre })
    return usuario
  }

  async update(id: number, input: ActualizarUsuarioInput): Promise<UsuarioConRol> {
    const usuario = await this.prisma.usuario.update({ where: { id }, data: input, include: usuarioInclude })
    await registrarAuditoria(this.prisma, 'usuario', usuario.id, 'UPDATE', {
      usuario: usuario.usuario,
      cambioPassword: Boolean(input.passwordHash)
    })
    return usuario
  }

  async remove(id: number): Promise<void> {
    const ventasCount = await this.prisma.venta.count({ where: { usuarioId: id } })
    if (ventasCount > 0) {
      await this.prisma.usuario.update({ where: { id }, data: { activo: false } })
      await registrarAuditoria(this.prisma, 'usuario', id, 'UPDATE', { accion: 'desactivado' })
      return
    }
    await this.prisma.usuario.delete({ where: { id } })
    await registrarAuditoria(this.prisma, 'usuario', id, 'DELETE')
  }

  listRoles() {
    return this.prisma.rol.findMany({ orderBy: { nombre: 'asc' } })
  }

  countActivos(): Promise<number> {
    return this.prisma.usuario.count({ where: { activo: true } })
  }
}

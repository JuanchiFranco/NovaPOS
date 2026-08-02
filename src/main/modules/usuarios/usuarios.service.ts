import type { UsuarioDTO } from '@shared/types/dto'
import type { UsuarioCreateInput, UsuarioUpdateInput } from '@shared/types/requests'
import { usuarioSchema, usuarioUpdateSchema } from '@shared/schemas/auth.schema'
import { hashPassword } from '../../shared/password'
import { ConflictError, NotFoundError, ValidationError } from '../../shared/errors'
import type { UsuarioConRol, UsuariosRepository } from './usuarios.repository'

const ROL_ADMINISTRADOR = 'Administrador'

export function toUsuarioDTO(usuario: UsuarioConRol): UsuarioDTO {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    usuario: usuario.usuario,
    activo: usuario.activo,
    rolId: usuario.rolId,
    rolNombre: usuario.rol.nombre,
    esAdministrador: usuario.rol.nombre === ROL_ADMINISTRADOR,
    createdAt: usuario.createdAt.toISOString()
  }
}

export class UsuariosService {
  constructor(private readonly repo: UsuariosRepository) {}

  async list(): Promise<UsuarioDTO[]> {
    const usuarios = await this.repo.findMany()
    return usuarios.map(toUsuarioDTO)
  }

  async roles() {
    const roles = await this.repo.listRoles()
    return roles.map((r) => ({ id: r.id, nombre: r.nombre, descripcion: r.descripcion }))
  }

  async create(input: UsuarioCreateInput): Promise<UsuarioDTO> {
    const parsed = usuarioSchema.parse(input)
    const existente = await this.repo.findByUsuario(parsed.usuario)
    if (existente) throw new ConflictError(`Ya existe un usuario con el nombre de usuario "${parsed.usuario}".`)

    const usuario = await this.repo.create({
      nombre: parsed.nombre,
      usuario: parsed.usuario,
      passwordHash: hashPassword(parsed.password),
      rolId: parsed.rolId
    })
    return toUsuarioDTO(usuario)
  }

  async update(id: number, input: UsuarioUpdateInput): Promise<UsuarioDTO> {
    const parsed = usuarioUpdateSchema.parse(input)
    const actual = await this.repo.findById(id)
    if (!actual) throw new NotFoundError('Usuario', id)

    if (parsed.usuario && parsed.usuario !== actual.usuario) {
      const existente = await this.repo.findByUsuario(parsed.usuario)
      if (existente) throw new ConflictError(`Ya existe un usuario con el nombre de usuario "${parsed.usuario}".`)
    }

    // Evita desactivar o cambiar de rol al último administrador activo del sistema.
    const dejaDeSerAdmin = actual.rol.nombre === ROL_ADMINISTRADOR && (input.activo === false || (parsed.rolId && parsed.rolId !== actual.rolId))
    if (dejaDeSerAdmin) {
      const admins = await this.repo.findMany()
      const otrosAdminsActivos = admins.filter(
        (u) => u.id !== id && u.activo && u.rol.nombre === ROL_ADMINISTRADOR
      )
      if (otrosAdminsActivos.length === 0) {
        throw new ValidationError('Debe existir al menos un administrador activo en el sistema.')
      }
    }

    const usuario = await this.repo.update(id, {
      nombre: parsed.nombre,
      usuario: parsed.usuario,
      rolId: parsed.rolId,
      activo: input.activo,
      ...(parsed.password ? { passwordHash: hashPassword(parsed.password) } : {})
    })
    return toUsuarioDTO(usuario)
  }

  async remove(id: number): Promise<void> {
    const actual = await this.repo.findById(id)
    if (!actual) throw new NotFoundError('Usuario', id)
    if (actual.rol.nombre === ROL_ADMINISTRADOR) {
      const admins = await this.repo.findMany()
      const otrosAdminsActivos = admins.filter((u) => u.id !== id && u.activo && u.rol.nombre === ROL_ADMINISTRADOR)
      if (otrosAdminsActivos.length === 0) {
        throw new ValidationError('Debe existir al menos un administrador activo en el sistema.')
      }
    }
    await this.repo.remove(id)
  }
}

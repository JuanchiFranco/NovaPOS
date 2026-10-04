import type { RolDTO, UsuarioDTO } from '@shared/types/dto'
import { ROL_ADMINISTRADOR, TODOS_LOS_PERMISOS, parsePermisos, tienePermiso } from '@shared/constants/permisos'
import type { UsuarioCreateInput, UsuarioUpdateInput } from '@shared/types/requests'
import { usuarioSchema, usuarioUpdateSchema } from '@shared/schemas/auth.schema'
import { hashPassword } from '../../shared/password'
import { ConflictError, NotFoundError, ValidationError } from '../../shared/errors'
import { getSessionUser } from '../auth/session'
import type { UsuarioConRol, UsuariosRepository } from './usuarios.repository'

export function toRolDTO(rol: { id: number; nombre: string; descripcion: string | null; permisos: string }, totalUsuarios: number): RolDTO {
  const esSistema = rol.nombre === ROL_ADMINISTRADOR
  return {
    id: rol.id,
    nombre: rol.nombre,
    descripcion: rol.descripcion,
    permisos: esSistema ? [...TODOS_LOS_PERMISOS] : parsePermisos(rol.permisos),
    esSistema,
    totalUsuarios
  }
}

export function toUsuarioDTO(usuario: UsuarioConRol): UsuarioDTO {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    usuario: usuario.usuario,
    activo: usuario.activo,
    rolId: usuario.rolId,
    rolNombre: usuario.rol.nombre,
    esAdministrador: usuario.rol.nombre === ROL_ADMINISTRADOR,
    permisos: toRolDTO(usuario.rol, 0).permisos,
    createdAt: usuario.createdAt.toISOString()
  }
}

export class UsuariosService {
  constructor(private readonly repo: UsuariosRepository) {}

  async list(): Promise<UsuarioDTO[]> {
    const usuarios = await this.repo.findMany()
    return usuarios.map(toUsuarioDTO)
  }

  async roles(): Promise<RolDTO[]> {
    const roles = await this.repo.listRoles()
    return roles.map((r) => toRolDTO(r, r._count.usuarios))
  }

  /**
   * Quien gestiona usuarios sin ser Administrador no puede tocar cuentas de administradores
   * ni asignar un rol con más permisos de los que él mismo tiene (evita escalar privilegios).
   */
  private async validarAsignacionRol(rolId: number): Promise<void> {
    const actor = getSessionUser()
    if (!actor || actor.esAdministrador) return
    const roles = await this.repo.listRoles()
    const rol = roles.find((r) => r.id === rolId)
    if (!rol) throw new NotFoundError('Rol', rolId)
    if (rol.nombre === ROL_ADMINISTRADOR) {
      throw new ValidationError('Solo un administrador puede asignar el rol Administrador.')
    }
    const excede = parsePermisos(rol.permisos).some((p) => !tienePermiso(actor.permisos, p))
    if (excede) {
      throw new ValidationError('No puedes asignar un rol con más permisos de los que tú tienes.')
    }
  }

  private validarCuentaAdministrador(objetivo: UsuarioConRol): void {
    const actor = getSessionUser()
    if (actor && !actor.esAdministrador && objetivo.rol.nombre === ROL_ADMINISTRADOR) {
      throw new ValidationError('Solo un administrador puede modificar cuentas de administradores.')
    }
  }

  async create(input: UsuarioCreateInput): Promise<UsuarioDTO> {
    const parsed = usuarioSchema.parse(input)
    await this.validarAsignacionRol(parsed.rolId)
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
    this.validarCuentaAdministrador(actual)
    if (parsed.rolId && parsed.rolId !== actual.rolId) await this.validarAsignacionRol(parsed.rolId)
    if (id === getSessionUser()?.id && (input.activo === false || (parsed.rolId && parsed.rolId !== actual.rolId))) {
      throw new ValidationError('No puedes desactivar tu propia cuenta ni cambiar tu propio rol.')
    }

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
    this.validarCuentaAdministrador(actual)
    if (id === getSessionUser()?.id) throw new ValidationError('No puedes eliminar tu propia cuenta.')
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

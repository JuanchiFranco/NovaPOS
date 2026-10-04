import type { RolDTO } from '@shared/types/dto'
import type { RolCreateInput, RolUpdateInput } from '@shared/types/requests'
import { ROL_ADMINISTRADOR, normalizarPermisos } from '@shared/constants/permisos'
import { rolSchema } from '@shared/schemas/rol.schema'
import { ConflictError, NotFoundError, ValidationError } from '../../shared/errors'
import { toRolDTO } from '../usuarios/usuarios.service'
import type { RolesRepository } from './roles.repository'

/** Alta, edición y baja de roles con permisos a medida. Solo un administrador puede invocarlo (ver roles.ipc.ts). */
export class RolesService {
  constructor(private readonly repo: RolesRepository) {}

  async list(): Promise<RolDTO[]> {
    const roles = await this.repo.findMany()
    return roles.map((r) => toRolDTO(r, r._count.usuarios))
  }

  async create(input: RolCreateInput): Promise<RolDTO> {
    const parsed = rolSchema.parse(input)
    if (parsed.nombre.toLowerCase() === ROL_ADMINISTRADOR.toLowerCase()) {
      throw new ConflictError('Ese nombre está reservado para el rol del sistema.')
    }
    if (await this.repo.findByNombre(parsed.nombre)) {
      throw new ConflictError(`Ya existe un rol llamado "${parsed.nombre}".`)
    }
    const rol = await this.repo.create({
      nombre: parsed.nombre,
      descripcion: parsed.descripcion,
      permisos: normalizarPermisos(parsed.permisos)
    })
    return toRolDTO(rol, rol._count.usuarios)
  }

  async update(id: number, input: RolUpdateInput): Promise<RolDTO> {
    const parsed = rolSchema.partial().parse(input)
    const actual = await this.repo.findById(id)
    if (!actual) throw new NotFoundError('Rol', id)
    if (actual.nombre === ROL_ADMINISTRADOR) {
      throw new ValidationError('El rol Administrador es del sistema y no se puede modificar.')
    }
    if (parsed.nombre && parsed.nombre !== actual.nombre) {
      if (parsed.nombre.toLowerCase() === ROL_ADMINISTRADOR.toLowerCase()) {
        throw new ConflictError('Ese nombre está reservado para el rol del sistema.')
      }
      if (await this.repo.findByNombre(parsed.nombre)) {
        throw new ConflictError(`Ya existe un rol llamado "${parsed.nombre}".`)
      }
    }
    const rol = await this.repo.update(id, {
      nombre: parsed.nombre,
      descripcion: input.descripcion === undefined ? undefined : (parsed.descripcion ?? null),
      permisos: parsed.permisos ? normalizarPermisos(parsed.permisos) : undefined
    })
    return toRolDTO(rol, rol._count.usuarios)
  }

  async remove(id: number): Promise<void> {
    const actual = await this.repo.findById(id)
    if (!actual) throw new NotFoundError('Rol', id)
    if (actual.nombre === ROL_ADMINISTRADOR) {
      throw new ValidationError('El rol Administrador es del sistema y no se puede eliminar.')
    }
    if (actual._count.usuarios > 0) {
      throw new ConflictError(
        `No se puede eliminar: hay ${actual._count.usuarios} usuario(s) con este rol. Reasígnalos a otro rol primero.`
      )
    }
    await this.repo.remove(id, actual.nombre)
  }
}

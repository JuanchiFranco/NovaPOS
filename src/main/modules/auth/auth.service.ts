import type { UsuarioDTO } from '@shared/types/dto'
import type { CambiarPasswordInput, LoginInput } from '@shared/types/requests'
import { loginSchema, cambiarPasswordSchema } from '@shared/schemas/auth.schema'
import { hashPassword, verifyPassword } from '../../shared/password'
import { ValidationError } from '../../shared/errors'
import { toUsuarioDTO } from '../usuarios/usuarios.service'
import type { UsuariosRepository } from '../usuarios/usuarios.repository'
import { getSessionUser, setSessionUser } from './session'

export class AuthService {
  constructor(private readonly usuariosRepo: UsuariosRepository) {}

  async login(input: LoginInput): Promise<UsuarioDTO> {
    const parsed = loginSchema.parse(input)
    const usuario = await this.usuariosRepo.findByUsuario(parsed.usuario)
    if (!usuario || !usuario.activo || !verifyPassword(parsed.password, usuario.passwordHash)) {
      throw new ValidationError('Usuario o contraseña incorrectos.')
    }
    const dto = toUsuarioDTO(usuario)
    setSessionUser(dto)
    return dto
  }

  logout(): void {
    setSessionUser(null)
  }

  me(): UsuarioDTO | null {
    return getSessionUser()
  }

  async cambiarPassword(input: CambiarPasswordInput): Promise<void> {
    const sesion = getSessionUser()
    if (!sesion) throw new ValidationError('No hay una sesión activa.')

    const parsed = cambiarPasswordSchema.parse({ actual: input.actual, nueva: input.nueva, confirmar: input.nueva })
    const usuario = await this.usuariosRepo.findById(sesion.id)
    if (!usuario || !verifyPassword(parsed.actual, usuario.passwordHash)) {
      throw new ValidationError('La contraseña actual no es correcta.')
    }
    await this.usuariosRepo.update(sesion.id, { passwordHash: hashPassword(parsed.nueva) })
  }
}

import type { UsuarioDTO } from '@shared/types/dto'
import type { CambiarPasswordInput, LoginInput } from '@shared/types/requests'
import { loginSchema, cambiarPasswordSchema } from '@shared/schemas/auth.schema'
import { hashPassword, verifyPassword } from '../../shared/password'
import { ValidationError } from '../../shared/errors'
import { toUsuarioDTO } from '../usuarios/usuarios.service'
import type { UsuariosRepository } from '../usuarios/usuarios.repository'
import { getSessionUser, setSessionUser } from './session'

/** Contraseña con la que se siembra el administrador inicial (ver database/seed.ts). */
export const PASSWORD_INICIAL = 'admin123'

const MAX_INTENTOS = 5
const BLOQUEO_MS = 5 * 60 * 1000

interface Intentos {
  fallidos: number
  bloqueadoHasta: number
}

export class AuthService {
  private readonly intentos = new Map<string, Intentos>()

  constructor(private readonly usuariosRepo: UsuariosRepository) {}

  private verificarBloqueo(clave: string): void {
    const registro = this.intentos.get(clave)
    if (registro && registro.bloqueadoHasta > Date.now()) {
      const minutos = Math.ceil((registro.bloqueadoHasta - Date.now()) / 60000)
      throw new ValidationError(`Demasiados intentos fallidos. Intenta de nuevo en ${minutos} min.`)
    }
  }

  private registrarFallo(clave: string): void {
    const actual = this.intentos.get(clave)
    const fallidos = (actual && actual.bloqueadoHasta <= Date.now() ? actual.fallidos : (actual?.fallidos ?? 0)) + 1
    this.intentos.set(clave, {
      fallidos: fallidos >= MAX_INTENTOS ? 0 : fallidos,
      bloqueadoHasta: fallidos >= MAX_INTENTOS ? Date.now() + BLOQUEO_MS : 0
    })
  }

  async login(input: LoginInput): Promise<UsuarioDTO> {
    const parsed = loginSchema.parse(input)
    const clave = parsed.usuario.toLowerCase()
    this.verificarBloqueo(clave)

    const usuario = await this.usuariosRepo.findByUsuario(parsed.usuario)
    if (!usuario || !usuario.activo || !verifyPassword(parsed.password, usuario.passwordHash)) {
      this.registrarFallo(clave)
      throw new ValidationError('Usuario o contraseña incorrectos.')
    }
    this.intentos.delete(clave)

    // Si el usuario sigue con la contraseña inicial por defecto, se le obliga a cambiarla antes de usar la app.
    const dto: UsuarioDTO = {
      ...toUsuarioDTO(usuario),
      debeCambiarPassword: verifyPassword(PASSWORD_INICIAL, usuario.passwordHash)
    }
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
    if (parsed.nueva === PASSWORD_INICIAL || parsed.nueva === parsed.actual) {
      throw new ValidationError('Elige una contraseña distinta a la actual y a la inicial por defecto.')
    }
    await this.usuariosRepo.update(sesion.id, { passwordHash: hashPassword(parsed.nueva) })
    setSessionUser({ ...sesion, debeCambiarPassword: false })
  }
}

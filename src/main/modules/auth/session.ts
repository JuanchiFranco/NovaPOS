import type { UsuarioDTO } from '@shared/types/dto'

/**
 * Sesión del usuario autenticado, en memoria del proceso main.
 * NovaPOS es una app de escritorio de una sola ventana/usuario a la vez:
 * no se requiere un token, basta con recordar quién inició sesión para
 * atribuir ventas y registros de auditoría, y para reforzar permisos por rol
 * (ver src/main/shared/ipc-handler.ts, donde se aplican en cada canal IPC).
 * Se reinicia en cada arranque de la app (se debe iniciar sesión de nuevo).
 */
let currentUser: UsuarioDTO | null = null

export function setSessionUser(user: UsuarioDTO | null): void {
  currentUser = user
}

export function getSessionUser(): UsuarioDTO | null {
  return currentUser
}

export function getSessionUserId(): number | null {
  return currentUser?.id ?? null
}

/** Verdadero si el usuario en sesión todavía debe cambiar su contraseña (p. ej. la inicial "admin123"). */
export function sessionDebeCambiarPassword(): boolean {
  return currentUser?.debeCambiarPassword === true
}

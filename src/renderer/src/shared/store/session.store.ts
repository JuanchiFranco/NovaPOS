import { create } from 'zustand'
import type { UsuarioDTO } from '@shared/types/dto'

interface SessionState {
  usuario: UsuarioDTO | null
  cargando: boolean
  cargarSesion: () => Promise<void>
  login: (usuario: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

/**
 * Sesión del usuario autenticado. El estado real vive en el proceso main
 * (ver src/main/modules/auth/session.ts); este store solo refleja esa sesión
 * para la UI. Se reinicia en cada arranque de la app (se debe iniciar sesión otra vez).
 */
export const useSessionStore = create<SessionState>((set) => ({
  usuario: null,
  cargando: true,
  cargarSesion: async () => {
    try {
      const usuario = await window.api.auth.me()
      set({ usuario, cargando: false })
    } catch {
      set({ usuario: null, cargando: false })
    }
  },
  login: async (usuario, password) => {
    const dto = await window.api.auth.login({ usuario, password })
    set({ usuario: dto })
  },
  logout: async () => {
    await window.api.auth.logout()
    set({ usuario: null })
  }
}))

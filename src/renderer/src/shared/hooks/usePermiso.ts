import type { Permiso } from '@shared/constants/permisos'
import { tienePermiso } from '@shared/constants/permisos'
import { useSessionStore } from '../store/session.store'

/**
 * Indica si el usuario en sesión tiene el permiso (o alguno de la lista).
 * Solo sirve para mostrar u ocultar opciones: el control real lo hace el main process.
 */
export function usePermiso(permiso: Permiso | readonly Permiso[]): boolean {
  return useSessionStore((s) => tienePermiso(s.usuario?.permisos, permiso))
}

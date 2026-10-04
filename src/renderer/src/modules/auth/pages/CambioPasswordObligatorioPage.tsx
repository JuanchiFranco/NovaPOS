import { ShieldAlert, LogOut } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { useSessionStore } from '../../../shared/store/session.store'
import { CambiarPasswordCard } from '../components/CambiarPasswordCard'

/**
 * Pantalla bloqueante que se muestra tras iniciar sesión con la contraseña inicial por defecto.
 * El main process rechaza cualquier otra operación hasta que se cambie (ver ipc-handler.ts).
 */
export default function CambioPasswordObligatorioPage(): JSX.Element {
  const cargarSesion = useSessionStore((s) => s.cargarSesion)
  const logout = useSessionStore((s) => s.logout)

  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500 text-white">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Cambia tu contraseña</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Estás usando la contraseña inicial. Por seguridad debes elegir una nueva antes de continuar.
            </p>
          </div>
        </div>

        <CambiarPasswordCard onSuccess={() => void cargarSesion()} />

        <Button variant="secondary" className="w-full" onClick={() => void logout()}>
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Button>
      </div>
    </div>
  )
}

import { LogOut, Moon, Sun, User } from 'lucide-react'
import { useThemeStore } from '../store/theme.store'
import { useSessionStore } from '../store/session.store'

export function Topbar({ title }: { title?: string }): JSX.Element {
  const { theme, toggleTheme } = useThemeStore()
  const { usuario, logout } = useSessionStore()

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="text-sm text-slate-500 dark:text-slate-400">{title}</div>
      <div className="flex items-center gap-3">
        {usuario && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <User className="h-4 w-4 text-slate-400" />
            <span className="font-medium">{usuario.nombre}</span>
            <span className="text-xs text-slate-400">· {usuario.rolNombre}</span>
          </div>
        )}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Cambiar tema"
          title="Cambiar tema claro/oscuro"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        {usuario && (
          <button
            onClick={() => logout()}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  )
}

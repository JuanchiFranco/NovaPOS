import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../store/theme.store'

export function Topbar({ title }: { title?: string }): JSX.Element {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="text-sm text-slate-500 dark:text-slate-400">{title}</div>
      <button
        onClick={toggleTheme}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Cambiar tema"
        title="Cambiar tema claro/oscuro"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </header>
  )
}

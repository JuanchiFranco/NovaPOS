import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  Boxes
} from 'lucide-react'
import { useConfiguracion } from '../../modules/configuracion/hooks/useConfiguracion'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/ventas', label: 'Ventas', icon: ShoppingCart },
  { to: '/facturas', label: 'Facturas', icon: FileText },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/inventario', label: 'Inventario', icon: Boxes },
  { to: '/configuracion', label: 'Configuración', icon: Settings }
]

function iniciales(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean)
  const letras = palabras.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '')
  return letras.join('') || 'IV'
}

export function Sidebar(): JSX.Element {
  const { data: config } = useConfiguracion()
  const nombreComercial = config?.nombreComercial ?? 'Inventario y Ventas'

  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-16 items-center gap-2 px-5">
        {config?.logoDataUrl ? (
          <img src={config.logoDataUrl} alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            {iniciales(nombreComercial)}
          </div>
        )}
        <span className="truncate font-semibold text-slate-900 dark:text-slate-100">{nombreComercial}</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4 text-xs text-slate-400 dark:border-slate-800">
        v1.0.0 · Funciona sin conexión
      </div>
    </aside>
  )
}

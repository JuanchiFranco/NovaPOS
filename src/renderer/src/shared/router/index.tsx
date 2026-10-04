import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { Spinner } from '../components/Spinner'
import { Navigate } from 'react-router-dom'
import type { Permiso } from '@shared/constants/permisos'
import { tienePermiso } from '@shared/constants/permisos'
import { useSessionStore } from '../store/session.store'

const DashboardPage = lazy(() => import('../../modules/dashboard/pages/DashboardPage'))
const VentasPage = lazy(() => import('../../modules/ventas/pages/VentasPage'))
const FacturasPage = lazy(() => import('../../modules/facturas/pages/FacturasPage'))
const FacturaPrintPage = lazy(() => import('../../modules/facturas/pages/FacturaPrintPage'))
const ProductosPage = lazy(() => import('../../modules/productos/pages/ProductosPage'))
const ClientesPage = lazy(() => import('../../modules/clientes/pages/ClientesPage'))
const ConfiguracionPage = lazy(() => import('../../modules/configuracion/pages/ConfiguracionPage'))
const InventarioPage = lazy(() => import('../../modules/inventario/pages/InventarioPage'))
const ComprasPage = lazy(() => import('../../modules/compras/pages/ComprasPage'))
const ReportesPage = lazy(() => import('../../modules/reportes/pages/ReportesPage'))
const AuditoriaPage = lazy(() => import('../../modules/auditoria/pages/AuditoriaPage'))
const LoginPage = lazy(() => import('../../modules/auth/pages/LoginPage'))
const CambioPasswordObligatorioPage = lazy(() => import('../../modules/auth/pages/CambioPasswordObligatorioPage'))

function SuspenseFallback(): JSX.Element {
  return <Spinner />
}

/** Muestra el layout protegido solo si hay una sesión activa; si no, la pantalla de login. */
function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
  const { usuario, cargando, cargarSesion } = useSessionStore()

  useEffect(() => {
    cargarSesion()
  }, [cargarSesion])

  if (cargando) return <SuspenseFallback />
  if (!usuario) return <LoginPage />
  if (usuario.debeCambiarPassword) return <CambioPasswordObligatorioPage />
  return children
}

/** Pantallas en el orden en que se ofrecen como inicio si el usuario no puede ver el Dashboard. */
const RUTAS_INICIO: { to: string; permiso?: Permiso }[] = [
  { to: '/ventas', permiso: 'ventas.crear' },
  { to: '/facturas', permiso: 'facturas.ver' },
  { to: '/inventario', permiso: 'inventario.ver' },
  { to: '/compras', permiso: 'compras.ver' },
  { to: '/reportes', permiso: 'reportes.ver' },
  { to: '/productos' }
]

/** Muestra la pantalla solo si el rol tiene el permiso; si no, lleva a la primera pantalla permitida. */
function RequirePermiso({ permiso, children }: { permiso: Permiso; children: JSX.Element }): JSX.Element {
  const permisos = useSessionStore((s) => s.usuario?.permisos)
  if (tienePermiso(permisos, permiso)) return children
  const destino = RUTAS_INICIO.find((r) => !r.permiso || tienePermiso(permisos, r.permiso))
  return <Navigate to={destino?.to ?? '/configuracion'} replace />
}

export function AppRouter(): JSX.Element {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* Ruta usada internamente por el main process (ventana oculta) para generar el PDF/impresión de facturas; no requiere sesión. */}
        <Route path="/imprimir/factura/:id" element={<FacturaPrintPage />} />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<RequirePermiso permiso="dashboard.ver"><DashboardPage /></RequirePermiso>} />
          <Route path="/ventas" element={<RequirePermiso permiso="ventas.crear"><VentasPage /></RequirePermiso>} />
          <Route path="/facturas" element={<RequirePermiso permiso="facturas.ver"><FacturasPage /></RequirePermiso>} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/inventario" element={<RequirePermiso permiso="inventario.ver"><InventarioPage /></RequirePermiso>} />
          <Route path="/compras" element={<RequirePermiso permiso="compras.ver"><ComprasPage /></RequirePermiso>} />
          <Route path="/reportes" element={<RequirePermiso permiso="reportes.ver"><ReportesPage /></RequirePermiso>} />
          <Route path="/auditoria" element={<RequirePermiso permiso="auditoria.ver"><AuditoriaPage /></RequirePermiso>} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

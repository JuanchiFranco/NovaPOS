import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { Spinner } from '../components/Spinner'
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
  return children
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
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ventas" element={<VentasPage />} />
          <Route path="/facturas" element={<FacturasPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/compras" element={<ComprasPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/auditoria" element={<AuditoriaPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

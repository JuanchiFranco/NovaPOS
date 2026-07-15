import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { Spinner } from '../components/Spinner'

const DashboardPage = lazy(() => import('../../modules/dashboard/pages/DashboardPage'))
const VentasPage = lazy(() => import('../../modules/ventas/pages/VentasPage'))
const FacturasPage = lazy(() => import('../../modules/facturas/pages/FacturasPage'))
const FacturaPrintPage = lazy(() => import('../../modules/facturas/pages/FacturaPrintPage'))
const ProductosPage = lazy(() => import('../../modules/productos/pages/ProductosPage'))
const ClientesPage = lazy(() => import('../../modules/clientes/pages/ClientesPage'))
const ConfiguracionPage = lazy(() => import('../../modules/configuracion/pages/ConfiguracionPage'))
const InventarioPage = lazy(() => import('../../modules/inventario/pages/InventarioPage'))
const ComprasPage = lazy(() => import('../../modules/compras/pages/ComprasPage'))

function SuspenseFallback(): JSX.Element {
  return <Spinner />
}

export function AppRouter(): JSX.Element {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route path="/imprimir/factura/:id" element={<FacturaPrintPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ventas" element={<VentasPage />} />
          <Route path="/facturas" element={<FacturasPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/compras" element={<ComprasPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

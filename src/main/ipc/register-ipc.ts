import type { PrismaClient } from '@prisma/client'
import { ClientesRepository } from '../modules/clientes/clientes.repository'
import { ClientesService } from '../modules/clientes/clientes.service'
import { registerClientesIpc } from '../modules/clientes/clientes.ipc'
import { ProductosRepository } from '../modules/productos/productos.repository'
import { ProductosService } from '../modules/productos/productos.service'
import { registerProductosIpc } from '../modules/productos/productos.ipc'
import { ConfiguracionRepository } from '../modules/configuracion/configuracion.repository'
import { ConfiguracionService } from '../modules/configuracion/configuracion.service'
import { registerConfiguracionIpc } from '../modules/configuracion/configuracion.ipc'
import { VentasRepository } from '../modules/ventas/ventas.repository'
import { VentasService } from '../modules/ventas/ventas.service'
import { registerVentasIpc } from '../modules/ventas/ventas.ipc'
import { FacturasRepository } from '../modules/facturas/facturas.repository'
import { FacturasService } from '../modules/facturas/facturas.service'
import { registerFacturasIpc } from '../modules/facturas/facturas.ipc'
import { DashboardRepository } from '../modules/dashboard/dashboard.repository'
import { DashboardService } from '../modules/dashboard/dashboard.service'
import { registerDashboardIpc } from '../modules/dashboard/dashboard.ipc'
import { ComprasRepository } from '../modules/compras/compras.repository'
import { ComprasService } from '../modules/compras/compras.service'
import { registerComprasIpc } from '../modules/compras/compras.ipc'
import { registerSistemaIpc } from '../modules/sistema/sistema.ipc'

/**
 * Composition root: cablea repository -> service -> ipc para cada módulo.
 * Mantiene el main process libre de lógica de negocio (Dependency Injection manual).
 */
export function registerAllIpcHandlers(prisma: PrismaClient): void {
  const configuracionService = new ConfiguracionService(new ConfiguracionRepository(prisma))
  registerConfiguracionIpc(configuracionService)

  const clientesService = new ClientesService(new ClientesRepository(prisma))
  registerClientesIpc(clientesService)

  const productosService = new ProductosService(new ProductosRepository(prisma))
  registerProductosIpc(productosService)

  const ventasService = new VentasService(new VentasRepository(prisma))
  registerVentasIpc(ventasService)

  const facturasService = new FacturasService(new FacturasRepository(prisma))
  registerFacturasIpc(facturasService)

  const dashboardService = new DashboardService(new DashboardRepository(prisma))
  registerDashboardIpc(dashboardService)

  const comprasService = new ComprasService(new ComprasRepository(prisma))
  registerComprasIpc(comprasService)

  registerSistemaIpc()
}

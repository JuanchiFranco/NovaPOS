import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC } from '@shared/constants/ipc-channels'
import type {
  ApiResult,
  AuditoriaDTO,
  BackupInfo,
  ClienteDTO,
  CategoriaDTO,
  ConfiguracionDTO,
  DashboardResumenDTO,
  FacturaCompraDTO,
  FacturaDTO,
  ImpresoraDTO,
  MovimientoInventarioDTO,
  PaginatedResult,
  ProductoDTO,
  ReporteComprasDTO,
  ReporteVentasDTO,
  RolDTO,
  UsuarioDTO,
  VentaDTO
} from '@shared/types/dto'
import type {
  AjusteInventarioInput,
  AuditoriaListParams,
  CambiarPasswordInput,
  ClienteCreateInput,
  ClienteListParams,
  ClienteUpdateInput,
  ConfiguracionUpdateInput,
  FacturaCompraCreateInput,
  FacturaCompraListParams,
  FacturaListParams,
  LoginInput,
  MovimientoInventarioListParams,
  ProductoCreateInput,
  ProductoListParams,
  ProductoUpdateInput,
  ReporteComprasParams,
  ReporteExportInput,
  ReporteVentasParams,
  UsuarioCreateInput,
  UsuarioUpdateInput,
  VentaCreateInput,
  VentaListParams
} from '@shared/types/requests'

/** Invoca un canal IPC y desempaqueta el ApiResult, lanzando si `ok` es false. */
async function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  const result = (await ipcRenderer.invoke(channel, ...args)) as ApiResult<T>
  if (!result.ok) throw new Error(result.error ?? 'Error desconocido')
  return result.data as T
}

const api = {
  clientes: {
    list: (params?: ClienteListParams) => invoke<PaginatedResult<ClienteDTO>>(IPC.clientes.list, params),
    getById: (id: number) => invoke<ClienteDTO>(IPC.clientes.getById, id),
    create: (input: ClienteCreateInput) => invoke<ClienteDTO>(IPC.clientes.create, input),
    update: (id: number, input: ClienteUpdateInput) => invoke<ClienteDTO>(IPC.clientes.update, id, input),
    remove: (id: number) => invoke<void>(IPC.clientes.remove, id)
  },
  productos: {
    list: (params?: ProductoListParams) => invoke<PaginatedResult<ProductoDTO>>(IPC.productos.list, params),
    getById: (id: number) => invoke<ProductoDTO>(IPC.productos.getById, id),
    create: (input: ProductoCreateInput) => invoke<ProductoDTO>(IPC.productos.create, input),
    update: (id: number, input: ProductoUpdateInput) => invoke<ProductoDTO>(IPC.productos.update, id, input),
    remove: (id: number) => invoke<void>(IPC.productos.remove, id),
    lowStock: () => invoke<ProductoDTO[]>(IPC.productos.lowStock),
    categorias: () => invoke<CategoriaDTO[]>(IPC.productos.categorias)
  },
  ventas: {
    list: (params?: VentaListParams) => invoke<PaginatedResult<VentaDTO>>(IPC.ventas.list, params),
    getById: (id: number) => invoke<VentaDTO>(IPC.ventas.getById, id),
    create: (input: VentaCreateInput) => invoke<VentaDTO>(IPC.ventas.create, input),
    anular: (id: number) => invoke<VentaDTO>(IPC.ventas.anular, id),
    remove: (id: number) => invoke<void>(IPC.ventas.remove, id)
  },
  facturas: {
    list: (params?: FacturaListParams) => invoke<PaginatedResult<FacturaDTO>>(IPC.facturas.list, params),
    getById: (id: number) => invoke<FacturaDTO>(IPC.facturas.getById, id),
    getByVentaId: (ventaId: number) => invoke<FacturaDTO>(IPC.facturas.getByVentaId, ventaId),
    exportPdf: (id: number) => invoke<string | null>(IPC.facturas.exportPdf, id),
    print: (id: number) => invoke<boolean>(IPC.facturas.print, id)
  },
  dashboard: {
    resumen: () => invoke<DashboardResumenDTO>(IPC.dashboard.resumen)
  },
  inventario: {
    movimientos: (params?: MovimientoInventarioListParams) =>
      invoke<PaginatedResult<MovimientoInventarioDTO>>(IPC.inventario.movimientos, params),
    ajustar: (input: AjusteInventarioInput) => invoke<MovimientoInventarioDTO>(IPC.inventario.ajustar, input)
  },
  reportes: {
    ventas: (params: ReporteVentasParams) => invoke<ReporteVentasDTO>(IPC.reportes.ventas, params),
    compras: (params: ReporteComprasParams) => invoke<ReporteComprasDTO>(IPC.reportes.compras, params),
    exportarVentas: (input: ReporteExportInput<ReporteVentasParams>) =>
      invoke<string | null>(IPC.reportes.exportarVentas, input),
    exportarCompras: (input: ReporteExportInput<ReporteComprasParams>) =>
      invoke<string | null>(IPC.reportes.exportarCompras, input)
  },
  compras: {
    list: (params?: FacturaCompraListParams) => invoke<PaginatedResult<FacturaCompraDTO>>(IPC.compras.list, params),
    getById: (id: number) => invoke<FacturaCompraDTO>(IPC.compras.getById, id),
    create: (input: FacturaCompraCreateInput) => invoke<FacturaCompraDTO>(IPC.compras.create, input),
    remove: (id: number) => invoke<void>(IPC.compras.remove, id)
  },
  configuracion: {
    get: () => invoke<ConfiguracionDTO>(IPC.configuracion.get),
    update: (input: ConfiguracionUpdateInput) => invoke<ConfiguracionDTO>(IPC.configuracion.update, input),
    seleccionarLogo: () => invoke<ConfiguracionDTO | null>(IPC.configuracion.seleccionarLogo),
    setImpresora: (nombre: string) => invoke<ConfiguracionDTO>(IPC.configuracion.setImpresora, nombre)
  },
  sistema: {
    backupNow: () => invoke<BackupInfo>(IPC.sistema.backupNow),
    listBackups: () => invoke<BackupInfo[]>(IPC.sistema.listBackups),
    restoreBackup: (fileName: string) => invoke<boolean>(IPC.sistema.restoreBackup, fileName),
    listarImpresoras: () => invoke<ImpresoraDTO[]>(IPC.sistema.listarImpresoras)
  },
  auth: {
    login: (input: LoginInput) => invoke<UsuarioDTO>(IPC.auth.login, input),
    logout: () => invoke<boolean>(IPC.auth.logout),
    me: () => invoke<UsuarioDTO | null>(IPC.auth.me),
    cambiarPassword: (input: CambiarPasswordInput) => invoke<void>(IPC.auth.cambiarPassword, input)
  },
  usuarios: {
    list: () => invoke<UsuarioDTO[]>(IPC.usuarios.list),
    roles: () => invoke<RolDTO[]>(IPC.usuarios.roles),
    create: (input: UsuarioCreateInput) => invoke<UsuarioDTO>(IPC.usuarios.create, input),
    update: (id: number, input: UsuarioUpdateInput) => invoke<UsuarioDTO>(IPC.usuarios.update, id, input),
    remove: (id: number) => invoke<void>(IPC.usuarios.remove, id)
  },
  auditoria: {
    list: (params?: AuditoriaListParams) => invoke<PaginatedResult<AuditoriaDTO>>(IPC.auditoria.list, params),
    entidades: () => invoke<string[]>(IPC.auditoria.entidades)
  }
}

export type InventarioAPI = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
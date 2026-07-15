/**
 * Nombres de canales IPC, agrupados por módulo.
 * Única fuente de verdad usada por preload (bridge) y por los handlers del main process.
 */
export const IPC = {
  clientes: {
    list: 'clientes:list',
    getById: 'clientes:getById',
    create: 'clientes:create',
    update: 'clientes:update',
    remove: 'clientes:remove'
  },
  productos: {
    list: 'productos:list',
    getById: 'productos:getById',
    create: 'productos:create',
    update: 'productos:update',
    remove: 'productos:remove',
    lowStock: 'productos:lowStock',
    categorias: 'productos:categorias'
  },
  ventas: {
    list: 'ventas:list',
    getById: 'ventas:getById',
    create: 'ventas:create',
    anular: 'ventas:anular'
  },
  facturas: {
    list: 'facturas:list',
    getById: 'facturas:getById',
    getByVentaId: 'facturas:getByVentaId',
    exportPdf: 'facturas:exportPdf',
    print: 'facturas:print'
  },
  inventario: {
    movimientos: 'inventario:movimientos',
    ajustar: 'inventario:ajustar'
  },
  dashboard: {
    resumen: 'dashboard:resumen'
  },
  configuracion: {
    get: 'configuracion:get',
    update: 'configuracion:update',
    seleccionarLogo: 'configuracion:seleccionarLogo'
  },
  sistema: {
    backupNow: 'sistema:backupNow',
    restoreBackup: 'sistema:restoreBackup',
    listBackups: 'sistema:listBackups'
  }
} as const

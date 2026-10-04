/**
 * Catálogo de permisos de NovaPOS. Cada rol guarda la lista de permisos que concede
 * (JSON array de claves en la columna `roles.permisos`). El rol "Administrador" siempre
 * tiene todos y no se puede modificar. Se aplican en el main process (ver ipc-handler.ts);
 * la interfaz solo los usa para mostrar u ocultar opciones.
 */
export const PERMISOS = [
  { clave: 'ventas.crear', grupo: 'Ventas y facturas', etiqueta: 'Registrar ventas' },
  { clave: 'ventas.anular', grupo: 'Ventas y facturas', etiqueta: 'Anular ventas' },
  { clave: 'facturas.ver', grupo: 'Ventas y facturas', etiqueta: 'Consultar, reimprimir y exportar facturas' },
  { clave: 'productos.editar', grupo: 'Productos', etiqueta: 'Crear y editar productos' },
  { clave: 'productos.precios', grupo: 'Productos', etiqueta: 'Cambiar precios y stock al editar un producto', requiere: ['productos.editar'] },
  { clave: 'productos.eliminar', grupo: 'Productos', etiqueta: 'Eliminar o desactivar productos' },
  { clave: 'clientes.editar', grupo: 'Clientes', etiqueta: 'Crear y editar clientes' },
  { clave: 'clientes.eliminar', grupo: 'Clientes', etiqueta: 'Eliminar clientes' },
  { clave: 'inventario.ver', grupo: 'Inventario', etiqueta: 'Ver movimientos de inventario' },
  { clave: 'inventario.ajustar', grupo: 'Inventario', etiqueta: 'Registrar entradas, salidas y ajustes', requiere: ['inventario.ver'] },
  { clave: 'compras.ver', grupo: 'Compras', etiqueta: 'Ver compras' },
  { clave: 'compras.crear', grupo: 'Compras', etiqueta: 'Registrar compras', requiere: ['compras.ver'] },
  { clave: 'compras.eliminar', grupo: 'Compras', etiqueta: 'Eliminar compras', requiere: ['compras.ver'] },
  { clave: 'dashboard.ver', grupo: 'Informes', etiqueta: 'Ver el panel de resumen (Dashboard)' },
  { clave: 'reportes.ver', grupo: 'Informes', etiqueta: 'Ver y exportar reportes' },
  { clave: 'configuracion.editar', grupo: 'Administración', etiqueta: 'Editar la configuración del negocio' },
  { clave: 'usuarios.gestionar', grupo: 'Administración', etiqueta: 'Crear y editar usuarios' },
  { clave: 'auditoria.ver', grupo: 'Administración', etiqueta: 'Ver el registro de auditoría' },
  { clave: 'sistema.backups', grupo: 'Administración', etiqueta: 'Crear y restaurar copias de seguridad' }
] as const satisfies readonly { clave: string; grupo: string; etiqueta: string; requiere?: readonly string[] }[]

export type Permiso = (typeof PERMISOS)[number]['clave']

export const TODOS_LOS_PERMISOS: Permiso[] = PERMISOS.map((p) => p.clave)

export const ROL_ADMINISTRADOR = 'Administrador'

/** Permisos con los que se siembra el rol "Vendedor": operar la caja sin tocar precios ni administración. */
export const PERMISOS_VENDEDOR: Permiso[] = [
  'ventas.crear',
  'facturas.ver',
  'productos.editar',
  'clientes.editar',
  'inventario.ver',
  'compras.ver',
  'dashboard.ver',
  'reportes.ver'
]

const ES_PERMISO = new Set<string>(TODOS_LOS_PERMISOS)

/** Agrega los permisos de los que dependen otros (p. ej. cambiar precios exige poder editar productos). */
export function normalizarPermisos(permisos: readonly string[]): Permiso[] {
  const resultado = new Set<Permiso>(permisos.filter((p): p is Permiso => ES_PERMISO.has(p)))
  for (const def of PERMISOS) {
    if (resultado.has(def.clave) && 'requiere' in def) {
      for (const r of def.requiere) resultado.add(r)
    }
  }
  return TODOS_LOS_PERMISOS.filter((p) => resultado.has(p))
}

/** Equivalencia del formato antiguo (permisos por módulo: { ventas: true, ... }). */
const LEGADO: Record<string, Permiso[]> = {
  ventas: ['ventas.crear'],
  clientes: ['clientes.editar'],
  productos: ['productos.editar'],
  inventario: ['inventario.ver', 'inventario.ajustar'],
  compras: ['compras.ver', 'compras.crear'],
  facturas: ['facturas.ver'],
  reportes: ['reportes.ver'],
  configuracion: ['configuracion.editar'],
  usuarios: ['usuarios.gestionar'],
  auditoria: ['auditoria.ver']
}

/** Interpreta el JSON guardado en `roles.permisos`, tanto el formato nuevo (array) como el antiguo (objeto). */
export function parsePermisos(json: string | null | undefined): Permiso[] {
  if (!json) return []
  try {
    const data: unknown = JSON.parse(json)
    if (Array.isArray(data)) return normalizarPermisos(data.filter((x): x is string => typeof x === 'string'))
    if (data && typeof data === 'object') {
      const claves = Object.entries(data as Record<string, unknown>)
        .filter(([, valor]) => valor === true)
        .flatMap(([modulo]) => LEGADO[modulo] ?? [])
      return normalizarPermisos(['dashboard.ver', ...claves])
    }
  } catch {
    // JSON corrupto: se trata como un rol sin permisos.
  }
  return []
}

export function esFormatoLegado(json: string | null | undefined): boolean {
  try {
    const data: unknown = JSON.parse(json ?? '')
    return !Array.isArray(data)
  } catch {
    return true
  }
}

export function tienePermiso(permisos: readonly string[] | undefined, requerido: Permiso | readonly Permiso[]): boolean {
  if (!permisos) return false
  const lista = Array.isArray(requerido) ? requerido : [requerido as Permiso]
  return lista.some((p) => permisos.includes(p))
}

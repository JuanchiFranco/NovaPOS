/**
 * DTOs compartidos entre el proceso main (Prisma) y el renderer (React).
 * Se definen de forma independiente del cliente de Prisma para no acoplar el
 * bundle del renderer a dependencias nativas de Node.
 */

export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MIXTO'
export type EstadoVenta = 'COMPLETADA' | 'ANULADA'
export type EstadoFactura = 'EMITIDA' | 'ANULADA'
export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE'

export interface ClienteDTO {
  id: number
  nombre: string
  telefono: string | null
  direccion: string | null
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoriaDTO {
  id: number
  nombre: string
}

export interface ProductoDTO {
  id: number
  codigo: string
  nombre: string
  categoriaId: number | null
  categoriaNombre: string | null
  precioCompra: number
  precioVenta: number
  stock: number
  stockMinimo: number
  descripcion: string | null
  activo: boolean
  bajoStock: boolean
  createdAt: string
  updatedAt: string
}

export interface DetalleVentaDTO {
  id: number
  productoId: number
  productoNombre: string
  productoCodigo: string
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
}

export interface VentaDTO {
  id: number
  clienteId: number | null
  clienteNombre: string | null
  subtotal: number
  descuento: number
  iva: number
  total: number
  metodoPago: MetodoPago
  montoEfectivo: number | null
  montoTarjeta: number | null
  montoTransferencia: number | null
  estado: EstadoVenta
  notas: string | null
  detalle: DetalleVentaDTO[]
  facturaNumero: string | null
  createdAt: string
}

export interface DetalleFacturaDTO {
  id: number
  productoNombre: string
  productoCodigo: string
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
}

export interface FacturaDTO {
  id: number
  numero: string
  consecutivo: number
  ventaId: number
  cliente: {
    id: number
    nombre: string
    telefono: string | null
    direccion: string | null
  } | null
  subtotal: number
  descuento: number
  iva: number
  total: number
  metodoPago: MetodoPago
  estado: EstadoFactura
  detalle: DetalleFacturaDTO[]
  fechaEmision: string
}

export type MetodoPagoCompra = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'

export interface DetalleCompraDTO {
  id: number
  descripcion: string
  cantidad: number
  valorUnitario: number
  subtotal: number
}

export interface FacturaCompraDTO {
  id: number
  proveedorNombre: string
  numeroFactura: string | null
  fecha: string
  metodoPago: MetodoPagoCompra | null
  total: number
  notas: string | null
  detalle: DetalleCompraDTO[]
  createdAt: string
}

export interface MovimientoInventarioDTO {
  id: number
  productoId: number
  productoNombre: string
  productoCodigo: string
  tipo: TipoMovimiento
  cantidad: number
  stockAnterior: number
  stockNuevo: number
  motivo: string | null
  ventaId: number | null
  createdAt: string
}

export interface ConfiguracionDTO {
  id: number
  nombreComercial: string
  eslogan: string | null
  mensajePie: string | null
  nit: string | null
  direccion: string | null
  telefono: string | null
  correo: string | null
  logoPath: string | null
  logoDataUrl: string | null
  porcentajeIva: number
  moneda: string
  simboloMoneda: string
  prefijoFactura: string
  numeroInicialFactura: number
  siguienteNumeroFactura: number
  impresoraPredeterminada: string | null
}

export interface DashboardResumenDTO {
  ventasHoy: { total: number; cantidad: number }
  ventasMes: { total: number; cantidad: number }
  totalFacturado: number
  productosMasVendidos: { productoId: number; nombre: string; cantidad: number }[]
  ultimasVentas: VentaDTO[]
  productosBajoStock: ProductoDTO[]
  ventasPorDia: { fecha: string; total: number }[]
  comprasMes: { total: number; cantidad: number }
  ultimasCompras: FacturaCompraDTO[]
}

export interface BackupInfo {
  fileName: string
  createdAt: string
  sizeBytes: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResult<T> {
  ok: boolean
  data?: T
  error?: string
}

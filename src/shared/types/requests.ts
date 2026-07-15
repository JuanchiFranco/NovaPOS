import type { MetodoPago, MetodoPagoCompra } from './dto'

export interface ClienteListParams {
  search?: string
  page?: number
  pageSize?: number
}

export interface ClienteCreateInput {
  nombre: string
  telefono?: string
  direccion?: string
}

export type ClienteUpdateInput = Partial<ClienteCreateInput> & { activo?: boolean }

export interface ProductoListParams {
  search?: string
  categoriaId?: number
  soloBajoStock?: boolean
  page?: number
  pageSize?: number
}

export interface ProductoCreateInput {
  codigo: string
  nombre: string
  categoriaId?: number | null
  categoriaNombre?: string
  precioCompra: number
  precioVenta: number
  stock: number
  stockMinimo: number
  descripcion?: string
}

export type ProductoUpdateInput = Partial<ProductoCreateInput> & { activo?: boolean }

export interface ItemVentaInput {
  productoId: number
  cantidad: number
  precioUnitario: number
  descuento?: number
}

export interface VentaCreateInput {
  clienteId?: number | null
  items: ItemVentaInput[]
  descuentoGlobal?: number
  metodoPago: MetodoPago
  montoEfectivo?: number
  montoTarjeta?: number
  montoTransferencia?: number
  notas?: string
  usuarioId?: number | null
}

export interface VentaListParams {
  desde?: string
  hasta?: string
  clienteId?: number
  page?: number
  pageSize?: number
}

export interface FacturaListParams {
  desde?: string
  hasta?: string
  clienteId?: number
  numero?: string
  productoNombre?: string
  metodoPago?: MetodoPago
  page?: number
  pageSize?: number
}

export interface ConfiguracionUpdateInput {
  nombreComercial: string
  eslogan?: string
  mensajePie?: string
  nit?: string
  direccion?: string
  telefono?: string
  correo?: string
  porcentajeIva: number
  moneda: string
  simboloMoneda: string
  prefijoFactura: string
  numeroInicialFactura: number
}

export interface MovimientoInventarioListParams {
  productoId?: number
  tipo?: string
  desde?: string
  hasta?: string
  page?: number
  pageSize?: number
}

export interface AjusteInventarioInput {
  productoId: number
  cantidad: number
  motivo: string
}

export interface ItemCompraInput {
  descripcion: string
  cantidad: number
  valorUnitario: number
}

export interface FacturaCompraCreateInput {
  proveedorNombre: string
  numeroFactura?: string
  fecha?: string
  metodoPago?: MetodoPagoCompra
  notas?: string
  items: ItemCompraInput[]
}

export interface FacturaCompraListParams {
  proveedorNombre?: string
  desde?: string
  hasta?: string
  page?: number
  pageSize?: number
}

import type { CartItem } from '../../../shared/store/cart.store'

export interface TotalesVenta {
  subtotalBruto: number
  descuentoItems: number
  descuentoGlobal: number
  descuentoTotal: number
  baseImponible: number
  iva: number
  total: number
}

/** Réplica en el cliente del cálculo que hace el servicio de ventas en el main process. No se cobra IVA. */
export function calcularTotales(items: CartItem[], descuentoGlobal: number): TotalesVenta {
  const subtotalBruto = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
  const descuentoItems = items.reduce((acc, i) => acc + i.descuento, 0)
  const descuentoTotal = descuentoItems + descuentoGlobal
  const baseImponible = Math.max(0, subtotalBruto - descuentoTotal)
  const iva = 0
  const total = baseImponible

  return { subtotalBruto, descuentoItems, descuentoGlobal, descuentoTotal, baseImponible, iva, total }
}

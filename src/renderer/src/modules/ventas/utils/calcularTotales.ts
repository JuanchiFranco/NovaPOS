import type { CartItem } from '../../../shared/store/cart.store'

export interface TotalesVenta {
  subtotalBruto: number
  descuentoItems: number
  descuentoGlobal: number
  descuentoTotal: number
  baseImponible: number
  /** IVA contenido en el total (los precios ya lo incluyen). 0 si el % configurado es 0. */
  iva: number
  total: number
}

/**
 * Réplica en el cliente del cálculo que hace el servicio de ventas en el main process
 * (que es quien manda: valida precios y recalcula todo). Los precios incluyen IVA; el IVA
 * solo se desglosa, el total no cambia.
 */
export function calcularTotales(items: CartItem[], descuentoGlobal: number, porcentajeIva = 0): TotalesVenta {
  const subtotalBruto = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
  const descuentoItems = items.reduce((acc, i) => acc + i.descuento, 0)
  const descuentoTotal = descuentoItems + descuentoGlobal
  const baseImponible = Math.max(0, subtotalBruto - descuentoTotal)
  const total = baseImponible
  const iva = porcentajeIva > 0 ? total - total / (1 + porcentajeIva / 100) : 0

  return { subtotalBruto, descuentoItems, descuentoGlobal, descuentoTotal, baseImponible, iva, total }
}

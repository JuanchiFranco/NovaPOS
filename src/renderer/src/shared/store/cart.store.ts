import { create } from 'zustand'
import type { ProductoDTO } from '@shared/types/dto'

export type TipoPrecio = 'DETAL' | 'MAYORISTA'

export interface CartItem {
  productoId: number
  nombre: string
  codigo: string
  precioDetal: number
  precioMayorista: number | null
  precioUnitario: number
  cantidad: number
  descuento: number
  stockDisponible: number
}

function precioSegunTipo(item: { precioDetal: number; precioMayorista: number | null }, tipo: TipoPrecio): number {
  return tipo === 'MAYORISTA' && item.precioMayorista != null ? item.precioMayorista : item.precioDetal
}

interface CartState {
  clienteId: number | null
  clienteNombre: string | null
  tipoPrecio: TipoPrecio
  items: CartItem[]
  setCliente: (id: number | null, nombre: string | null) => void
  setTipoPrecio: (tipo: TipoPrecio) => void
  addProducto: (producto: ProductoDTO) => void
  incrementar: (productoId: number) => void
  decrementar: (productoId: number) => void
  setCantidad: (productoId: number, cantidad: number) => void
  setDescuento: (productoId: number, descuento: number) => void
  removeItem: (productoId: number) => void
  clear: () => void
  cargarCarrito: (clienteId: number | null, clienteNombre: string | null, items: CartItem[]) => void
}

export const useCartStore = create<CartState>((set) => ({
  clienteId: null,
  clienteNombre: null,
  tipoPrecio: 'DETAL',
  items: [],
  setCliente: (id, nombre) => set({ clienteId: id, clienteNombre: nombre }),
  setTipoPrecio: (tipo) =>
    set((state) => ({
      tipoPrecio: tipo,
      items: state.items.map((i) => ({ ...i, precioUnitario: precioSegunTipo(i, tipo) }))
    })),
  addProducto: (producto) =>
    set((state) => {
      const existing = state.items.find((i) => i.productoId === producto.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productoId === producto.id
              ? { ...i, cantidad: Math.min(i.cantidad + 1, i.stockDisponible || i.cantidad + 1) }
              : i
          )
        }
      }
      const nuevoItem = {
        precioDetal: producto.precioVenta,
        precioMayorista: producto.precioMayorista
      }
      return {
        items: [
          ...state.items,
          {
            productoId: producto.id,
            nombre: producto.nombre,
            codigo: producto.codigo,
            precioDetal: nuevoItem.precioDetal,
            precioMayorista: nuevoItem.precioMayorista,
            precioUnitario: precioSegunTipo(nuevoItem, state.tipoPrecio),
            cantidad: 1,
            descuento: 0,
            stockDisponible: producto.stock
          }
        ]
      }
    }),
  incrementar: (productoId) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productoId === productoId ? { ...i, cantidad: Math.min(i.cantidad + 1, i.stockDisponible) } : i
      )
    })),
  decrementar: (productoId) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.productoId === productoId ? { ...i, cantidad: i.cantidad - 1 } : i))
        .filter((i) => i.cantidad > 0)
    })),
  setCantidad: (productoId, cantidad) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productoId === productoId ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.stockDisponible)) } : i
      )
    })),
  setDescuento: (productoId, descuento) =>
    set((state) => ({
      items: state.items.map((i) => (i.productoId === productoId ? { ...i, descuento: Math.max(0, descuento) } : i))
    })),
  removeItem: (productoId) => set((state) => ({ items: state.items.filter((i) => i.productoId !== productoId) })),
  clear: () => set({ clienteId: null, clienteNombre: null, tipoPrecio: 'DETAL', items: [] }),
  cargarCarrito: (clienteId, clienteNombre, items) => set({ clienteId, clienteNombre, tipoPrecio: 'DETAL', items })
}))
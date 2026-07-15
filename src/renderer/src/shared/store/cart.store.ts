import { create } from 'zustand'
import type { ProductoDTO } from '@shared/types/dto'

export interface CartItem {
  productoId: number
  nombre: string
  codigo: string
  precioUnitario: number
  cantidad: number
  descuento: number
  stockDisponible: number
}

interface CartState {
  clienteId: number | null
  clienteNombre: string | null
  items: CartItem[]
  setCliente: (id: number | null, nombre: string | null) => void
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
  items: [],
  setCliente: (id, nombre) => set({ clienteId: id, clienteNombre: nombre }),
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
      return {
        items: [
          ...state.items,
          {
            productoId: producto.id,
            nombre: producto.nombre,
            codigo: producto.codigo,
            precioUnitario: producto.precioVenta,
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
  clear: () => set({ clienteId: null, clienteNombre: null, items: [] }),
  cargarCarrito: (clienteId, clienteNombre, items) => set({ clienteId, clienteNombre, items })
}))
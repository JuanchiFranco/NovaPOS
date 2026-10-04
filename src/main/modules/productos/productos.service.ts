import type { CategoriaDTO, PaginatedResult, ProductoDTO } from '@shared/types/dto'
import type { ProductoCreateInput, ProductoListParams, ProductoUpdateInput } from '@shared/types/requests'
import { productoSchema, productoUpdateSchema } from '@shared/schemas/producto.schema'
import { NotFoundError, ValidationError } from '../../shared/errors'
import { tienePermiso } from '@shared/constants/permisos'
import { getSessionUser } from '../auth/session'
import type { ProductosRepository } from './productos.repository'
import type { Categoria, Producto } from '@prisma/client'

export type ProductoConCategoria = Producto & { categoria: Categoria | null }

export function toProductoDTO(producto: ProductoConCategoria): ProductoDTO {
  return {
    id: producto.id,
    codigo: producto.codigo,
    nombre: producto.nombre,
    categoriaId: producto.categoriaId,
    categoriaNombre: producto.categoria?.nombre ?? null,
    precioCompra: producto.precioCompra,
    precioVenta: producto.precioVenta,
    precioMayorista: producto.precioMayorista,
    stock: producto.stock,
    stockMinimo: producto.stockMinimo,
    descripcion: producto.descripcion,
    activo: producto.activo,
    bajoStock: producto.stock <= producto.stockMinimo,
    createdAt: producto.createdAt.toISOString(),
    updatedAt: producto.updatedAt.toISOString()
  }
}

export class ProductosService {
  constructor(private readonly repo: ProductosRepository) {}

  async list(params: ProductoListParams): Promise<PaginatedResult<ProductoDTO>> {
    const result = await this.repo.findMany(params)
    return { ...result, data: result.data.map(toProductoDTO) }
  }

  async getById(id: number): Promise<ProductoDTO> {
    const producto = await this.repo.findById(id)
    if (!producto) throw new NotFoundError('Producto', id)
    return toProductoDTO(producto)
  }

  async lowStock(): Promise<ProductoDTO[]> {
    const rows = await this.repo.findLowStock()
    const ids = rows.map((r) => r.id)
    if (ids.length === 0) return []
    const productos = await Promise.all(ids.map((id) => this.repo.findById(id)))
    return productos.filter((p): p is ProductoConCategoria => p !== null).map(toProductoDTO)
  }

  async categorias(): Promise<CategoriaDTO[]> {
    const categorias = await this.repo.listCategorias()
    return categorias.map((c) => ({ id: c.id, nombre: c.nombre }))
  }

  async create(input: ProductoCreateInput): Promise<ProductoDTO> {
    const parsed = productoSchema.parse(input)
    const created = await this.repo.create(parsed)
    return toProductoDTO(created)
  }

  async update(id: number, input: ProductoUpdateInput): Promise<ProductoDTO> {
    const parsed = productoUpdateSchema.parse(input)

    // Precios y stock solo los modifica quien tenga el permiso "productos.precios": un vendedor podría cambiar el precio,
    // vender y revertirlo. El stock se ajusta desde Inventario (movimientos auditados), no editando el producto.
    if (!tienePermiso(getSessionUser()?.permisos, 'productos.precios')) {
      const actual = await this.repo.findById(id)
      if (!actual) throw new NotFoundError('Producto', id)
      const cambia = (nuevo: number | null | undefined, previo: number | null): boolean =>
        nuevo !== undefined && nuevo !== previo
      if (
        cambia(parsed.precioCompra, actual.precioCompra) ||
        cambia(parsed.precioVenta, actual.precioVenta) ||
        cambia(parsed.precioMayorista, actual.precioMayorista)
      ) {
        throw new ValidationError('No tienes permiso para cambiar los precios de un producto.')
      }
      if (cambia(parsed.stock, actual.stock)) {
        throw new ValidationError('El stock se ajusta desde Inventario (entradas, salidas o ajustes), no editando el producto.')
      }
    }

    const updated = await this.repo.update(id, { ...parsed, activo: input.activo })
    return toProductoDTO(updated)
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }
}
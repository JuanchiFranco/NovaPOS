import type { Prisma, PrismaClient } from '@prisma/client'
import type { ProductoCreateInput, ProductoListParams, ProductoUpdateInput } from '@shared/types/requests'

export class ProductosRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(params: ProductoListParams) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20

    let bajoStockIds: number[] | null = null
    if (params.soloBajoStock) {
      const rows = await this.findLowStock()
      bajoStockIds = rows.map((r) => r.id)
    }

    const where: Prisma.ProductoWhereInput = {
      ...(params.search
        ? { OR: [{ nombre: { contains: params.search } }, { codigo: { contains: params.search } }] }
        : {}),
      ...(params.categoriaId ? { categoriaId: params.categoriaId } : {}),
      ...(bajoStockIds ? { id: { in: bajoStockIds } } : {})
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.producto.findMany({
        where,
        include: { categoria: true },
        orderBy: { nombre: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.producto.count({ where })
    ])

    return { data, total, page, pageSize }
  }

  /** Bajo stock requiere comparar dos columnas; se resuelve con SQL crudo por límite de Prisma en SQLite. */
  async findLowStock() {
    return this.prisma.$queryRaw<
      { id: number }[]
    >`SELECT id FROM productos WHERE activo = 1 AND stock <= stockMinimo`
  }

  findById(id: number) {
    return this.prisma.producto.findUnique({ where: { id }, include: { categoria: true } })
  }

  findByIds(ids: number[]) {
    return this.prisma.producto.findMany({ where: { id: { in: ids } } })
  }

  async listCategorias() {
    return this.prisma.categoria.findMany({ orderBy: { nombre: 'asc' } })
  }

  private async resolveCategoriaId(categoriaId?: number | null, categoriaNombre?: string): Promise<number | null> {
    if (categoriaId) return categoriaId
    if (categoriaNombre && categoriaNombre.trim().length > 0) {
      const categoria = await this.prisma.categoria.upsert({
        where: { nombre: categoriaNombre.trim() },
        create: { nombre: categoriaNombre.trim() },
        update: {}
      })
      return categoria.id
    }
    return null
  }

  async create(input: ProductoCreateInput) {
    const categoriaId = await this.resolveCategoriaId(input.categoriaId, input.categoriaNombre)
    return this.prisma.producto.create({
      data: {
        codigo: input.codigo,
        nombre: input.nombre,
        categoriaId,
        precioCompra: input.precioCompra,
        precioVenta: input.precioVenta,
        stock: input.stock,
        stockMinimo: input.stockMinimo,
        descripcion: input.descripcion
      },
      include: { categoria: true }
    })
  }

  async update(id: number, input: ProductoUpdateInput) {
    const categoriaId =
      input.categoriaId !== undefined || input.categoriaNombre !== undefined
        ? await this.resolveCategoriaId(input.categoriaId, input.categoriaNombre)
        : undefined

    return this.prisma.producto.update({
      where: { id },
      data: {
        codigo: input.codigo,
        nombre: input.nombre,
        categoriaId,
        precioCompra: input.precioCompra,
        precioVenta: input.precioVenta,
        stock: input.stock,
        stockMinimo: input.stockMinimo,
        descripcion: input.descripcion,
        activo: input.activo
      },
      include: { categoria: true }
    })
  }

  async remove(id: number) {
    const ventasCount = await this.prisma.detalleVenta.count({ where: { productoId: id } })
    if (ventasCount > 0) {
      return this.prisma.producto.update({
        where: { id },
        data: { activo: false }
      })
    }
    return this.prisma.producto.delete({ where: { id } })
  }
}
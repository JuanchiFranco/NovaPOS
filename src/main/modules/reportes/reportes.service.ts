import type {
  ReporteAgrupacion,
  ReporteComprasAgrupacion,
  ReporteComprasDTO,
  ReporteComprasFilaDTO,
  ReporteVentasDTO,
  ReporteVentasFilaDTO
} from '@shared/types/dto'
import type { ReporteComprasParams, ReporteVentasParams } from '@shared/types/requests'
import type { FacturaCompra } from '@prisma/client'
import { anioKeyLabel, diaKeyLabel, esAgrupacionTemporal, isoWeekKeyLabel, mesKeyLabel, metodoPagoLabel } from './reportes.helpers'
import type { DetalleVentaConRelaciones, ReportesRepository } from './reportes.repository'

interface AgrupadoVentas extends ReporteVentasFilaDTO {
  ventaIds: Set<number>
}

function claveVentas(row: DetalleVentaConRelaciones, agrupacion: ReporteAgrupacion): { key: string; label: string } {
  switch (agrupacion) {
    case 'dia':
      return diaKeyLabel(row.venta.createdAt)
    case 'semana':
      return isoWeekKeyLabel(row.venta.createdAt)
    case 'mes':
      return mesKeyLabel(row.venta.createdAt)
    case 'anio':
      return anioKeyLabel(row.venta.createdAt)
    case 'cliente':
      return {
        key: String(row.venta.clienteId ?? 'sin-cliente'),
        label: row.venta.cliente?.nombre ?? 'Consumidor final'
      }
    case 'producto':
      return { key: String(row.productoId), label: row.producto.nombre }
    case 'categoria':
      return {
        key: String(row.producto.categoriaId ?? 'sin-categoria'),
        label: row.producto.categoria?.nombre ?? 'Sin categoría'
      }
    case 'metodoPago':
      return { key: row.venta.metodoPago, label: metodoPagoLabel[row.venta.metodoPago as keyof typeof metodoPagoLabel] ?? row.venta.metodoPago }
  }
}

export class ReportesService {
  constructor(private readonly repo: ReportesRepository) {}

  async reporteVentas(params: ReporteVentasParams): Promise<ReporteVentasDTO> {
    const rows = await this.repo.findDetalleVentas(params)

    const grupos = new Map<string, AgrupadoVentas>()
    for (const row of rows) {
      const { key, label } = claveVentas(row, params.agrupacion)
      let grupo = grupos.get(key)
      if (!grupo) {
        grupo = {
          clave: key,
          etiqueta: label,
          cantidadVentas: 0,
          unidadesVendidas: 0,
          subtotal: 0,
          descuento: 0,
          total: 0,
          ventaIds: new Set()
        }
        grupos.set(key, grupo)
      }
      grupo.ventaIds.add(row.ventaId)
      grupo.unidadesVendidas += row.cantidad
      grupo.subtotal += row.precioUnitario * row.cantidad
      grupo.descuento += row.descuento
      grupo.total += row.subtotal
    }

    const temporal = esAgrupacionTemporal(params.agrupacion)
    const filas: ReporteVentasFilaDTO[] = Array.from(grupos.values())
      .map(({ ventaIds, ...resto }) => ({ ...resto, cantidadVentas: ventaIds.size }))
      .sort((a, b) => (temporal ? a.clave.localeCompare(b.clave) : b.total - a.total))

    const ventaIdsUnicos = new Set(rows.map((r) => r.ventaId))
    const totales = rows.reduce(
      (acc, row) => ({
        cantidadVentas: ventaIdsUnicos.size,
        unidadesVendidas: acc.unidadesVendidas + row.cantidad,
        subtotal: acc.subtotal + row.precioUnitario * row.cantidad,
        descuento: acc.descuento + row.descuento,
        total: acc.total + row.subtotal
      }),
      { cantidadVentas: 0, unidadesVendidas: 0, subtotal: 0, descuento: 0, total: 0 }
    )

    return {
      agrupacion: params.agrupacion,
      desde: params.desde ?? null,
      hasta: params.hasta ?? null,
      filas,
      totales
    }
  }

  async reporteCompras(params: ReporteComprasParams): Promise<ReporteComprasDTO> {
    const rows = await this.repo.findFacturasCompra(params)

    function clave(row: FacturaCompra): { key: string; label: string } {
      switch (params.agrupacion) {
        case 'dia':
          return diaKeyLabel(row.fecha)
        case 'semana':
          return isoWeekKeyLabel(row.fecha)
        case 'mes':
          return mesKeyLabel(row.fecha)
        case 'anio':
          return anioKeyLabel(row.fecha)
        case 'proveedor':
          return { key: row.proveedorNombre, label: row.proveedorNombre }
      }
    }

    const grupos = new Map<string, ReporteComprasFilaDTO>()
    for (const row of rows) {
      const { key, label } = clave(row)
      let grupo = grupos.get(key)
      if (!grupo) {
        grupo = { clave: key, etiqueta: label, cantidadCompras: 0, total: 0 }
        grupos.set(key, grupo)
      }
      grupo.cantidadCompras += 1
      grupo.total += row.total
    }

    const temporal = esAgrupacionTemporal(params.agrupacion as ReporteComprasAgrupacion)
    const filas = Array.from(grupos.values()).sort((a, b) => (temporal ? a.clave.localeCompare(b.clave) : b.total - a.total))

    const totales = rows.reduce(
      (acc, row) => ({ cantidadCompras: acc.cantidadCompras + 1, total: acc.total + row.total }),
      { cantidadCompras: 0, total: 0 }
    )

    return {
      agrupacion: params.agrupacion,
      desde: params.desde ?? null,
      hasta: params.hasta ?? null,
      filas,
      totales
    }
  }
}

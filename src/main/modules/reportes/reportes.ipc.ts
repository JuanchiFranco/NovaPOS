import { dialog } from 'electron'
import { writeFileSync } from 'fs'
import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import { AppError } from '../../shared/errors'
import { logger } from '../../shared/logger'
import type { ReportesService } from './reportes.service'
import type { ConfiguracionService } from '../configuracion/configuracion.service'
import type { ReporteComprasParams, ReporteExportInput, ReporteVentasParams } from '@shared/types/requests'
import type { ReporteFormato } from '@shared/types/dto'
import { buildCsv, buildReportHtml, buildXlsxBuffer, renderHtmlToPdf, type CellValue } from './reportes.export'
import { formatCurrencySimple, formatDateEs } from './reportes.helpers'

const agrupacionVentasLabel: Record<ReporteVentasParams['agrupacion'], string> = {
  dia: 'por día',
  semana: 'por semana',
  mes: 'por mes',
  anio: 'por año',
  cliente: 'por cliente',
  producto: 'por producto',
  categoria: 'por categoría',
  metodoPago: 'por método de pago'
}

const agrupacionComprasLabel: Record<ReporteComprasParams['agrupacion'], string> = {
  dia: 'por día',
  semana: 'por semana',
  mes: 'por mes',
  anio: 'por año',
  proveedor: 'por proveedor'
}

function subtitulo(desde?: string, hasta?: string): string {
  const rango = `${desde ? `Desde ${formatDateEs(desde)}` : 'Desde el inicio'} · ${hasta ? `hasta ${formatDateEs(hasta)}` : 'hasta hoy'}`
  return `${rango} · Generado el ${formatDateEs(new Date())}`
}

interface ExportSpec {
  formato: ReporteFormato
  defaultName: string
  sheetName: string
  headers: string[]
  rows: CellValue[][]
  rowsFormateadas: CellValue[][]
  filaTotales: CellValue[]
  filaTotalesFormateada: CellValue[]
  empresa: string
  titulo: string
  subtitulo: string
}

async function exportarArchivo(spec: ExportSpec): Promise<string | null> {
  const filters =
    spec.formato === 'csv'
      ? [{ name: 'CSV', extensions: ['csv'] }]
      : spec.formato === 'xlsx'
        ? [{ name: 'Excel', extensions: ['xlsx'] }]
        : [{ name: 'PDF', extensions: ['pdf'] }]

  const result = await dialog.showSaveDialog({
    title: 'Exportar reporte',
    defaultPath: `${spec.defaultName}.${spec.formato}`,
    filters
  })
  if (result.canceled || !result.filePath) return null

  let data: Buffer | string
  if (spec.formato === 'csv') {
    data = buildCsv(spec.headers, [...spec.rows, spec.filaTotales])
  } else if (spec.formato === 'xlsx') {
    data = buildXlsxBuffer(spec.sheetName, spec.headers, [...spec.rows, spec.filaTotales])
  } else {
    const html = buildReportHtml({
      empresa: spec.empresa,
      titulo: spec.titulo,
      subtitulo: spec.subtitulo,
      headers: spec.headers,
      rows: spec.rowsFormateadas,
      filaTotales: spec.filaTotalesFormateada
    })
    data = await renderHtmlToPdf(html)
  }

  writeFileSync(result.filePath, data)
  return result.filePath
}

export function registerReportesIpc(service: ReportesService, configuracionService: ConfiguracionService): void {
  handle(IPC.reportes.ventas, (params: ReporteVentasParams) => service.reporteVentas(params))
  handle(IPC.reportes.compras, (params: ReporteComprasParams) => service.reporteCompras(params))

  handle(IPC.reportes.exportarVentas, async ({ params, formato }: ReporteExportInput<ReporteVentasParams>) => {
    try {
      const reporte = await service.reporteVentas(params)
      const config = await configuracionService.get()
      const money = (v: number): string => formatCurrencySimple(v, config.simboloMoneda)

      const headers = ['Grupo', 'N.º ventas', 'Unidades', 'Subtotal', 'Descuento', 'Total']
      const rows: CellValue[][] = reporte.filas.map((f) => [
        f.etiqueta,
        f.cantidadVentas,
        f.unidadesVendidas,
        f.subtotal,
        f.descuento,
        f.total
      ])
      const rowsFormateadas: CellValue[][] = reporte.filas.map((f) => [
        f.etiqueta,
        f.cantidadVentas,
        f.unidadesVendidas,
        money(f.subtotal),
        money(f.descuento),
        money(f.total)
      ])
      const filaTotales: CellValue[] = [
        'Total',
        reporte.totales.cantidadVentas,
        reporte.totales.unidadesVendidas,
        reporte.totales.subtotal,
        reporte.totales.descuento,
        reporte.totales.total
      ]
      const filaTotalesFormateada: CellValue[] = [
        'Total',
        reporte.totales.cantidadVentas,
        reporte.totales.unidadesVendidas,
        money(reporte.totales.subtotal),
        money(reporte.totales.descuento),
        money(reporte.totales.total)
      ]

      return await exportarArchivo({
        formato,
        defaultName: 'reporte-ventas',
        sheetName: 'Ventas',
        headers,
        rows,
        rowsFormateadas,
        filaTotales,
        filaTotalesFormateada,
        empresa: config.nombreComercial,
        titulo: `Reporte de ventas ${agrupacionVentasLabel[params.agrupacion]}`,
        subtitulo: subtitulo(params.desde, params.hasta)
      })
    } catch (error) {
      logger.error('Error exportando reporte de ventas', error)
      throw new AppError('No se pudo exportar el reporte de ventas.')
    }
  })

  handle(IPC.reportes.exportarCompras, async ({ params, formato }: ReporteExportInput<ReporteComprasParams>) => {
    try {
      const reporte = await service.reporteCompras(params)
      const config = await configuracionService.get()
      const money = (v: number): string => formatCurrencySimple(v, config.simboloMoneda)

      const headers = ['Grupo', 'N.º compras', 'Total']
      const rows: CellValue[][] = reporte.filas.map((f) => [f.etiqueta, f.cantidadCompras, f.total])
      const rowsFormateadas: CellValue[][] = reporte.filas.map((f) => [f.etiqueta, f.cantidadCompras, money(f.total)])
      const filaTotales: CellValue[] = ['Total', reporte.totales.cantidadCompras, reporte.totales.total]
      const filaTotalesFormateada: CellValue[] = ['Total', reporte.totales.cantidadCompras, money(reporte.totales.total)]

      return await exportarArchivo({
        formato,
        defaultName: 'reporte-compras',
        sheetName: 'Compras',
        headers,
        rows,
        rowsFormateadas,
        filaTotales,
        filaTotalesFormateada,
        empresa: config.nombreComercial,
        titulo: `Reporte de compras ${agrupacionComprasLabel[params.agrupacion]}`,
        subtitulo: subtitulo(params.desde, params.hasta)
      })
    } catch (error) {
      logger.error('Error exportando reporte de compras', error)
      throw new AppError('No se pudo exportar el reporte de compras.')
    }
  })
}

import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { ReporteComprasParams, ReporteExportInput, ReporteVentasParams } from '@shared/types/requests'

export function useReporteVentas(params: ReporteVentasParams) {
  return useQuery({
    queryKey: ['reportes', 'ventas', params],
    queryFn: () => window.api.reportes.ventas(params),
    placeholderData: (prev) => prev
  })
}

export function useReporteCompras(params: ReporteComprasParams) {
  return useQuery({
    queryKey: ['reportes', 'compras', params],
    queryFn: () => window.api.reportes.compras(params),
    placeholderData: (prev) => prev
  })
}

export function useExportarReporteVentas() {
  return useMutation({
    mutationFn: (input: ReporteExportInput<ReporteVentasParams>) => window.api.reportes.exportarVentas(input),
    onSuccess: (filePath) => {
      if (filePath) toast.success('Reporte exportado correctamente')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

export function useExportarReporteCompras() {
  return useMutation({
    mutationFn: (input: ReporteExportInput<ReporteComprasParams>) => window.api.reportes.exportarCompras(input),
    onSuccess: (filePath) => {
      if (filePath) toast.success('Reporte exportado correctamente')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

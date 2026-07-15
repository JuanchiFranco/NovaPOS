import { useQuery } from '@tanstack/react-query'
import type { FacturaListParams } from '@shared/types/requests'

export function useFacturas(params: FacturaListParams) {
  return useQuery({
    queryKey: ['facturas', params],
    queryFn: () => window.api.facturas.list(params),
    placeholderData: (prev) => prev
  })
}

export function useFactura(id: number | null) {
  return useQuery({
    queryKey: ['facturas', 'detalle', id],
    queryFn: () => window.api.facturas.getById(id as number),
    enabled: id !== null
  })
}

import { useQuery } from '@tanstack/react-query'
import type { AuditoriaListParams } from '@shared/types/requests'

export function useAuditoria(params: AuditoriaListParams) {
  return useQuery({
    queryKey: ['auditoria', params],
    queryFn: () => window.api.auditoria.list(params),
    placeholderData: (prev) => prev
  })
}

export function useEntidadesAuditoria() {
  return useQuery({ queryKey: ['auditoria', 'entidades'], queryFn: () => window.api.auditoria.entidades() })
}

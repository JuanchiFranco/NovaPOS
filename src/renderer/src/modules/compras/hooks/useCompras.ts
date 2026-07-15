import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { FacturaCompraCreateInput, FacturaCompraListParams } from '@shared/types/requests'

const key = (params: FacturaCompraListParams) => ['compras', params]

export function useCompras(params: FacturaCompraListParams) {
  return useQuery({
    queryKey: key(params),
    queryFn: () => window.api.compras.list(params),
    placeholderData: (prev) => prev
  })
}

export function useCreateCompra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: FacturaCompraCreateInput) => window.api.compras.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] })
      toast.success('Compra registrada')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

export function useRemoveCompra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.compras.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] })
      toast.success('Compra eliminada')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

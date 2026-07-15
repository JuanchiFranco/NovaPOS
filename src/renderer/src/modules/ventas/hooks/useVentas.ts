import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { VentaCreateInput, VentaListParams } from '@shared/types/requests'

export function useVentas(params: VentaListParams) {
  return useQuery({ queryKey: ['ventas', params], queryFn: () => window.api.ventas.list(params) })
}

export function useCreateVenta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: VentaCreateInput) => window.api.ventas.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      queryClient.invalidateQueries({ queryKey: ['facturas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Venta registrada correctamente')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AjusteInventarioInput, MovimientoInventarioListParams } from '@shared/types/requests'

const key = (params: MovimientoInventarioListParams) => ['inventario', 'movimientos', params]

export function useMovimientosInventario(params: MovimientoInventarioListParams) {
  return useQuery({
    queryKey: key(params),
    queryFn: () => window.api.inventario.movimientos(params),
    placeholderData: (prev) => prev
  })
}

export function useRegistrarMovimiento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AjusteInventarioInput) => window.api.inventario.ajustar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Movimiento registrado')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

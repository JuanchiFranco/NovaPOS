import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { ConfiguracionUpdateInput } from '@shared/types/requests'
import { configureCurrency } from '../../../shared/lib/format'

const QUERY_KEY = ['configuracion']

export function useConfiguracion() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const config = await window.api.configuracion.get()
      configureCurrency(config.moneda)
      return config
    }
  })
}

export function useUpdateConfiguracion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ConfiguracionUpdateInput) => window.api.configuracion.update(input),
    onSuccess: (config) => {
      configureCurrency(config.moneda)
      queryClient.setQueryData(QUERY_KEY, config)
      toast.success('Configuración actualizada')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

export function useSeleccionarLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => window.api.configuracion.seleccionarLogo(),
    onSuccess: (config) => {
      if (config) {
        queryClient.setQueryData(QUERY_KEY, config)
        toast.success('Logo actualizado')
      }
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

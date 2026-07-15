import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { ClienteCreateInput, ClienteListParams, ClienteUpdateInput } from '@shared/types/requests'

const key = (params: ClienteListParams) => ['clientes', params]

export function useClientes(params: ClienteListParams) {
  return useQuery({
    queryKey: key(params),
    queryFn: () => window.api.clientes.list(params),
    placeholderData: (prev) => prev
  })
}

export function useCreateCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ClienteCreateInput) => window.api.clientes.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      toast.success('Cliente creado')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

export function useUpdateCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ClienteUpdateInput }) => window.api.clientes.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      toast.success('Cliente actualizado')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

export function useRemoveCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.clientes.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      toast.success('Cliente eliminado')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

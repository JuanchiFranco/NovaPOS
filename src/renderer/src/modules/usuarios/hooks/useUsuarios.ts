import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { UsuarioCreateInput, UsuarioUpdateInput } from '@shared/types/requests'

export function useUsuarios() {
  return useQuery({ queryKey: ['usuarios'], queryFn: () => window.api.usuarios.list() })
}

export function useRolesUsuarios() {
  return useQuery({ queryKey: ['usuarios', 'roles'], queryFn: () => window.api.usuarios.roles() })
}

export function useCreateUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UsuarioCreateInput) => window.api.usuarios.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuario creado')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UsuarioUpdateInput }) => window.api.usuarios.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuario actualizado')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

export function useRemoveUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.usuarios.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuario eliminado')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

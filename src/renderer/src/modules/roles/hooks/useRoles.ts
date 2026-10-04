import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { RolCreateInput, RolUpdateInput } from '@shared/types/requests'

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: () => window.api.roles.list() })
}

function useInvalidarRoles() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] })
    queryClient.invalidateQueries({ queryKey: ['usuarios'] })
  }
}

export function useCreateRol() {
  const invalidar = useInvalidarRoles()
  return useMutation({
    mutationFn: (input: RolCreateInput) => window.api.roles.create(input),
    onSuccess: () => {
      invalidar()
      toast.success('Rol creado')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

export function useUpdateRol() {
  const invalidar = useInvalidarRoles()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: RolUpdateInput }) => window.api.roles.update(id, input),
    onSuccess: () => {
      invalidar()
      toast.success('Rol actualizado. Los cambios aplican la próxima vez que cada usuario inicie sesión.')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

export function useRemoveRol() {
  const invalidar = useInvalidarRoles()
  return useMutation({
    mutationFn: (id: number) => window.api.roles.remove(id),
    onSuccess: () => {
      invalidar()
      toast.success('Rol eliminado')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

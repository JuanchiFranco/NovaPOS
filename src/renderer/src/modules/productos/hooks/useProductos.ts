import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { ProductoCreateInput, ProductoListParams, ProductoUpdateInput } from '@shared/types/requests'

const key = (params: ProductoListParams) => ['productos', params]

export function useProductos(params: ProductoListParams) {
  return useQuery({
    queryKey: key(params),
    queryFn: () => window.api.productos.list(params),
    placeholderData: (prev) => prev
  })
}

export function useCategorias() {
  return useQuery({ queryKey: ['categorias'], queryFn: () => window.api.productos.categorias() })
}

export function useProductosBajoStock() {
  return useQuery({ queryKey: ['productos', 'bajo-stock'], queryFn: () => window.api.productos.lowStock() })
}

export function useCreateProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductoCreateInput) => window.api.productos.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Producto creado')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

export function useUpdateProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductoUpdateInput }) => window.api.productos.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Producto actualizado')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

export function useRemoveProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.productos.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Producto eliminado')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

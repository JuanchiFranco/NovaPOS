import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export function useBackups() {
  return useQuery({ queryKey: ['sistema', 'backups'], queryFn: () => window.api.sistema.listBackups() })
}

export function useImpresoras() {
  return useQuery({ queryKey: ['sistema', 'impresoras'], queryFn: () => window.api.sistema.listarImpresoras() })
}

export function useCrearBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => window.api.sistema.backupNow(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sistema', 'backups'] })
      toast.success('Backup creado correctamente')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

export function useRestaurarBackup() {
  return useMutation({
    mutationFn: (fileName: string) => window.api.sistema.restoreBackup(fileName),
    onSuccess: () => {
      toast.success('Backup restaurado. Reinicia la aplicación para ver los cambios.')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

export function useSetImpresora() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nombre: string) => window.api.configuracion.setImpresora(nombre),
    onSuccess: (config) => {
      queryClient.setQueryData(['configuracion'], config)
      toast.success('Impresora predeterminada actualizada')
    },
    onError: (error: Error) => toast.error(error.message)
  })
}

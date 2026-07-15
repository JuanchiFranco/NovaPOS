import { useQuery } from '@tanstack/react-query'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => window.api.dashboard.resumen(),
    refetchInterval: 60_000
  })
}

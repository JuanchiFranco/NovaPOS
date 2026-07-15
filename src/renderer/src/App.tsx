import { QueryClientProvider } from '@tanstack/react-query'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { queryClient } from './shared/lib/queryClient'
import { AppRouter } from './shared/router'

export default function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AppRouter />
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </HashRouter>
    </QueryClientProvider>
  )
}

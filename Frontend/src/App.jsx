import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { ErrorBoundary } from './components/layout/ErrorScreens.jsx'
import { ThemeProvider } from './hooks/useTheme.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import { createRouter } from './routes.jsx'

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, gcTime: 5 * 60_000, refetchOnWindowFocus: true, retry: false },
      mutations: { retry: false },
    },
  })
}

export default function App() {
  const [client] = useState(makeClient)
  const [router] = useState(createRouter)
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={client}>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

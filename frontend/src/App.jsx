import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {Toaster} from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react';

import { AppRouter } from './lib/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster />
          <AppRouter />
        </BrowserRouter>
        <Analytics />
      </QueryClientProvider>
    </>
  )
}

export default App

import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente compartido de TanStack Query para toda la aplicación.
 * Centraliza caché, reintentos y sincronización de datos del servidor.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

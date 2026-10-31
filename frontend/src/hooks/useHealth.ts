import { useQuery } from '@tanstack/react-query';
import { healthService } from '../services/health.service';

export const healthQueryKey = ['health'] as const;

/**
 * Consulta del estado de la API mediante TanStack Query.
 * Sirve como ejemplo del flujo: servicio HTTP + caché + sincronización.
 */
export function useHealth() {
  return useQuery({
    queryKey: healthQueryKey,
    queryFn: () => healthService.check(),
  });
}

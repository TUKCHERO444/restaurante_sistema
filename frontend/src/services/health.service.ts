import { api } from '../lib/api';
import type { HealthResponse } from '../types/api';

/**
 * Servicios HTTP. Todo acceso a la API pasa por aquí (a través de la
 * instancia centralizada `api`); los componentes nunca llaman a Axios
 * directamente. Los errores ya llegan normalizados como `ApiError`.
 */
export const healthService = {
  /** GET /health — verifica que la API responde. */
  async check(): Promise<HealthResponse> {
    const { data } = await api.get<HealthResponse>('/health');
    return data;
  },
};

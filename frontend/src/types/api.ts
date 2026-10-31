/**
 * Tipos compartidos para la comunicación HTTP/JSON con la API.
 */

/** Respuesta del endpoint de salud: GET /health */
export interface HealthResponse {
  status: 'ok';
  service: string;
  timestamp: string;
}

/** Error normalizado que devuelven los servicios HTTP del frontend. */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

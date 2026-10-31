import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types/api';

const TOKEN_KEY = 'restaurante-token';

/**
 * URL base de la API resuelta desde `VITE_API_URL` (ver `.env.example`).
 *
 * Si la variable no está definida se usa un valor por defecto en lugar de
 * dejar `baseURL` vacío: un `baseURL` vacío produce peticiones relativas que
 * el servidor de desarrollo responde con 404 (p. ej. al crear una mesa).
 */
const envApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const API_BASE_URL = envApiUrl || 'http://localhost:8000/api/v1';

if (import.meta.env.DEV && !envApiUrl) {
  console.warn(
    '[api] VITE_API_URL no está definida; se usará el valor por defecto:',
    API_BASE_URL,
  );
}

/**
 * Instancia centralizada de Axios.
 *
 * - La URL base sale de `VITE_API_URL` (ver `.env.example`).
 * - `withCredentials: true` deja preparado el flujo Sanctum SPA
 *   basado en cookies + sesión (requiere CORS con credenciales).
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

/**
 * Interceptor: adjunta el token Bearer a cada petición.
 * Lee el token de localStorage (donde lo guarda `useAuth`).
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Normaliza cualquier error de Axios (o desconocido) a un `ApiError`
 * con formato estable para toda la aplicación.
 */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    if (axiosError.code === 'ERR_NETWORK') {
      return {
        message:
          'No se pudo conectar con la API. Verifica que el backend esté en ejecución.',
        status,
        code: axiosError.code,
      };
    }

    return {
      message:
        data?.message ??
        axiosError.message ??
        'Error inesperado al comunicarse con la API.',
      status,
      code: axiosError.code,
      details: data,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'Error desconocido.' };
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);

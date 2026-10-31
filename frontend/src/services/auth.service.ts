import { api } from '../lib/api';
import type { LoginRequest, LoginResponse, Usuario } from '../types/auth';

/**
 * Servicios de autenticación. Gestiona login, logout y obtención
 * del usuario autenticado.
 */
export const authService = {
  /** POST /login — inicia sesión y devuelve token + usuario. */
  async login(credenciales: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/login', credenciales);
    return data;
  },

  /** POST /logout — cierra la sesión revocando el token. */
  async logout(): Promise<void> {
    await api.post('/logout');
  },

  /** GET /user — devuelve el usuario autenticado. */
  async user(): Promise<Usuario> {
    const { data } = await api.get<Usuario>('/user');
    return data;
  },
};

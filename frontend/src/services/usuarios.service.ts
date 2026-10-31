import { api } from '../lib/api';
import type { Usuario, UsuarioRequest } from '../types/auth';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Servicios CRUD de usuarios. Consume el endpoint protegido /usuarios.
 */
export const usuariosService = {
  /** GET /usuarios — lista paginada. */
  async listar(pagina = 1): Promise<PaginatedResponse<Usuario>> {
    const { data } = await api.get<PaginatedResponse<Usuario>>('/usuarios', {
      params: { page: pagina },
    });
    return data;
  },

  /** GET /usuarios/:id — obtiene un usuario. */
  async obtener(id: number): Promise<Usuario> {
    const { data } = await api.get<Usuario>(`/usuarios/${id}`);
    return data;
  },

  /** POST /usuarios — crea un usuario. */
  async crear(usuario: UsuarioRequest): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/usuarios', usuario);
    return data;
  },

  /** PUT /usuarios/:id — actualiza un usuario. */
  async actualizar(id: number, usuario: Partial<UsuarioRequest>): Promise<Usuario> {
    const { data } = await api.put<Usuario>(`/usuarios/${id}`, usuario);
    return data;
  },

  /** DELETE /usuarios/:id — elimina un usuario. */
  async eliminar(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },
};

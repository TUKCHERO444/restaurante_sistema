import { api } from '../lib/api';
import type { Categoria, PaginatedResponse } from '../types';

export const categoriasService = {
  getAll: () => api.get<PaginatedResponse<Categoria>>('/categorias').then((r: any) => r.data),
  get: (id: number) => api.get<Categoria>(`/categorias/${id}`).then((r: any) => r.data),
  create: (data: FormData) => api.post<Categoria>('/categorias', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((r: any) => r.data),
  update: (id: number, data: FormData) => api.put<Categoria>(`/categorias/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/categorias/${id}`).then((r: any) => r.data),
};

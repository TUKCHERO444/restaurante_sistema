import { api } from '../lib/api';
import type { Producto, PaginatedResponse } from '../types';

export const productosService = {
  getAll: () => api.get<PaginatedResponse<Producto>>('/productos').then((r: any) => r.data),
  get: (id: number) => api.get<Producto>(`/productos/${id}`).then((r: any) => r.data),
  create: (data: FormData) => api.post<Producto>('/productos', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((r: any) => r.data),
  update: (id: number, data: FormData) => api.put<Producto>(`/productos/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/productos/${id}`).then((r: any) => r.data),
  toggle: (id: number) => api.post<Producto>(`/productos/${id}/toggle`).then((r: any) => r.data),
  adjust: (id: number, data: { tipo: string; cantidad: number; nota?: string }) =>
    api.post<Producto>(`/productos/${id}/adjust`, data).then((r: any) => r.data),
  syncIngredientes: (id: number, data: { ingredientes: Array<{ id: number; cantidad: number }> }) =>
    api.post(`/productos/${id}/ingredientes`, data).then((r: any) => r.data),
};

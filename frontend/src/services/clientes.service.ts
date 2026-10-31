import { api } from '../lib/api';
import type { Cliente, PaginatedResponse } from '../types';

export const clientesService = {
  getAll: () => api.get<PaginatedResponse<Cliente>>('/clientes').then((r: any) => r.data),
  get: (id: number) => api.get<Cliente>(`/clientes/${id}`).then((r: any) => r.data),
  create: (data: Partial<Cliente>) => api.post<Cliente>('/clientes', data).then((r: any) => r.data),
  update: (id: number, data: Partial<Cliente>) => api.put<Cliente>(`/clientes/${id}`, data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/clientes/${id}`).then((r: any) => r.data),
};

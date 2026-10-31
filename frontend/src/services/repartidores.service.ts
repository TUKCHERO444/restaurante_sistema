import { api } from '../lib/api';
import type { Repartidor, PaginatedResponse } from '../types';

export const repartidoresService = {
  getAll: () => api.get<PaginatedResponse<Repartidor>>('/repartidores').then((r: any) => r.data),
  get: (id: number) => api.get<Repartidor>(`/repartidores/${id}`).then((r: any) => r.data),
  create: (data: Partial<Repartidor>) => api.post<Repartidor>('/repartidores', data).then((r: any) => r.data),
  update: (id: number, data: Partial<Repartidor>) => api.put<Repartidor>(`/repartidores/${id}`, data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/repartidores/${id}`).then((r: any) => r.data),
};

import { api } from '../lib/api';
import type { Gasto, PaginatedResponse } from '../types';

export const gastosService = {
  getAll: () => api.get<PaginatedResponse<Gasto>>('/gastos').then((r: any) => r.data),
  get: (id: number) => api.get<Gasto>(`/gastos/${id}`).then((r: any) => r.data),
  create: (data: Partial<Gasto>) => api.post<Gasto>('/gastos', data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/gastos/${id}`).then((r: any) => r.data),
};

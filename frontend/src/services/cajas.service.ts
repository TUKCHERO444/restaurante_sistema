import { api } from '../lib/api';
import type { Caja, PaginatedResponse } from '../types';

export const cajasService = {
  getAll: () => api.get<PaginatedResponse<Caja>>('/cajas').then((r: any) => r.data),
  get: (id: number) => api.get<Caja>(`/cajas/${id}`).then((r: any) => r.data),
  create: (data: { monto_apertura: number; notas?: string }) =>
    api.post<Caja>('/cajas', data).then((r: any) => r.data),
  close: (id: number, data: { monto_cierre: number; notas?: string }) =>
    api.post<Caja>(`/cajas/${id}/cerrar`, data).then((r: any) => r.data),
};

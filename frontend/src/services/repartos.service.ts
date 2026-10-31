import { api } from '../lib/api';
import type { Reparto, PaginatedResponse } from '../types';

export const repartosService = {
  getAll: () => api.get<PaginatedResponse<Reparto>>('/repartos').then((r: any) => r.data),
  get: (id: number) => api.get<Reparto>(`/repartos/${id}`).then((r: any) => r.data),
  create: (data: Partial<Reparto>) => api.post<Reparto>('/repartos', data).then((r: any) => r.data),
  update: (id: number, data: Partial<Reparto>) => api.put<Reparto>(`/repartos/${id}`, data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/repartos/${id}`).then((r: any) => r.data),
  updateStatus: (id: number, estado: string) =>
    api.post<Reparto>(`/repartos/${id}/estado`, { estado }).then((r: any) => r.data),
  assignDriver: (id: number, repartidorId: number) =>
    api.post<Reparto>(`/repartos/${id}/asignar`, { repartidor_id: repartidorId }).then((r: any) => r.data),
  checkout: (id: number, montoRecibido: number) =>
    api.post<Reparto>(`/repartos/${id}/checkout`, { monto_recibido: montoRecibido }).then((r: any) => r.data),
};

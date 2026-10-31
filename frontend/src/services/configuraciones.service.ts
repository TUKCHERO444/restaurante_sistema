import { api } from '../lib/api';
import type { Configuracion, PaginatedResponse } from '../types';

export const configuracionesService = {
  getAll: () => api.get<PaginatedResponse<Configuracion>>('/configuraciones').then((r: any) => r.data),
  get: (id: number) => api.get<Configuracion>(`/configuraciones/${id}`).then((r: any) => r.data),
  create: (data: Partial<Configuracion>) => api.post<Configuracion>('/configuraciones', data).then((r: any) => r.data),
  update: (id: number, data: Partial<Configuracion>) => api.put<Configuracion>(`/configuraciones/${id}`, data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/configuraciones/${id}`).then((r: any) => r.data),
};

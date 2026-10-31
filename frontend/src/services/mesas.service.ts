import { api } from '../lib/api';
import type { Mesa, PaginatedResponse } from '../types';

export const mesasService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Mesa>>('/mesas', { params }).then((r: any) => r.data),
  get: (id: number) => api.get<Mesa>(`/mesas/${id}`).then((r: any) => r.data),
  create: (data: Partial<Mesa>) => api.post<Mesa>('/mesas', data).then((r: any) => r.data),
  update: (id: number, data: Partial<Mesa>) => api.put<Mesa>(`/mesas/${id}`, data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/mesas/${id}`).then((r: any) => r.data),
  updatePositions: (posiciones: Array<{ id: number; x: number; y: number }>) =>
    api.post('/mesas/posiciones', { posiciones }).then((r: any) => r.data),
};

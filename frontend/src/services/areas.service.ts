import { api } from '../lib/api';
import type { Area, PaginatedResponse } from '../types';

export const areasService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Area>>('/areas', { params }).then((r: any) => r.data),
  get: (id: number) => api.get<Area>(`/areas/${id}`).then((r: any) => r.data),
  create: (data: Partial<Area>) => api.post<Area>('/areas', data).then((r: any) => r.data),
  update: (id: number, data: Partial<Area>) => api.put<Area>(`/areas/${id}`, data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/areas/${id}`).then((r: any) => r.data),
};

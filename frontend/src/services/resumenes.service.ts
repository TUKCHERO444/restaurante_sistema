import { api } from '../lib/api';
import type { ResumenDiario, PaginatedResponse } from '../types';

export const resumenesService = {
  getAll: () => api.get<PaginatedResponse<ResumenDiario>>('/resumenes-diarios').then((r: any) => r.data),
  get: (id: number) => api.get<ResumenDiario>(`/resumenes-diarios/${id}`).then((r: any) => r.data),
  create: (data: Partial<ResumenDiario>) => api.post<ResumenDiario>('/resumenes-diarios', data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/resumenes-diarios/${id}`).then((r: any) => r.data),
};

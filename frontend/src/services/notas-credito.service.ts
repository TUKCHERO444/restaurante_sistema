import { api } from '../lib/api';
import type { NotaCredito, PaginatedResponse } from '../types';

export const notasCreditoService = {
  getAll: () => api.get<PaginatedResponse<NotaCredito>>('/notas-credito').then((r: any) => r.data),
  get: (id: number) => api.get<NotaCredito>(`/notas-credito/${id}`).then((r: any) => r.data),
  create: (data: Partial<NotaCredito>) => api.post<NotaCredito>('/notas-credito', data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/notas-credito/${id}`).then((r: any) => r.data),
};

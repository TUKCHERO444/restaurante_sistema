import { api } from '../lib/api';
import type { SerieDocumento, PaginatedResponse } from '../types';

export const seriesService = {
  getAll: () => api.get<PaginatedResponse<SerieDocumento>>('/series-documentos').then((r: any) => r.data),
  get: (id: number) => api.get<SerieDocumento>(`/series-documentos/${id}`).then((r: any) => r.data),
  create: (data: Partial<SerieDocumento>) => api.post<SerieDocumento>('/series-documentos', data).then((r: any) => r.data),
  update: (id: number, data: Partial<SerieDocumento>) => api.put<SerieDocumento>(`/series-documentos/${id}`, data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/series-documentos/${id}`).then((r: any) => r.data),
};

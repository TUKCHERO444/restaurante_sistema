import { api } from '../lib/api';
import type { Reserva, PaginatedResponse } from '../types';

export const reservasService = {
  getAll: () => api.get<PaginatedResponse<Reserva>>('/reservas').then((r: any) => r.data),
  get: (id: number) => api.get<Reserva>(`/reservas/${id}`).then((r: any) => r.data),
  create: (data: Partial<Reserva>) => api.post<Reserva>('/reservas', data).then((r: any) => r.data),
  update: (id: number, data: Partial<Reserva>) => api.put<Reserva>(`/reservas/${id}`, data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/reservas/${id}`).then((r: any) => r.data),
  confirm: (id: number) => api.post<Reserva>(`/reservas/${id}/confirmar`).then((r: any) => r.data),
  cancel: (id: number) => api.post<Reserva>(`/reservas/${id}/cancelar`).then((r: any) => r.data),
};

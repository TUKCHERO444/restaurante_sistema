import { api } from '../lib/api';
import type { MovimientoInventario, PaginatedResponse } from '../types';

export const movimientosService = {
  getAll: () => api.get<PaginatedResponse<MovimientoInventario>>('/movimientos-inventario').then((r: any) => r.data),
  get: (id: number) => api.get<MovimientoInventario>(`/movimientos-inventario/${id}`).then((r: any) => r.data),
  create: (data: Partial<MovimientoInventario>) =>
    api.post<MovimientoInventario>('/movimientos-inventario', data).then((r: any) => r.data),
};

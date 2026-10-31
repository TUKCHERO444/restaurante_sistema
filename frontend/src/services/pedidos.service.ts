import { api } from '../lib/api';
import type { Pedido, PedidoDetalle, PaginatedResponse } from '../types';

export const pedidosService = {
  getAll: () => api.get<PaginatedResponse<Pedido>>('/pedidos').then((r: any) => r.data),
  get: (id: number) => api.get<Pedido>(`/pedidos/${id}`).then((r: any) => r.data),
  create: (data: Partial<Pedido>) => api.post<Pedido>('/pedidos', data).then((r: any) => r.data),
  update: (id: number, data: Partial<Pedido>) => api.put<Pedido>(`/pedidos/${id}`, data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/pedidos/${id}`).then((r: any) => r.data),
  addDetalle: (pedidoId: number, data: { producto_id: number; cantidad: number; nota?: string }) =>
    api.post<PedidoDetalle>(`/pedidos/${pedidoId}/detalles`, data).then((r: any) => r.data),
  updateDetalle: (pedidoId: number, detalleId: number, data: { cantidad: number }) =>
    api.put<PedidoDetalle>(`/pedidos/${pedidoId}/detalles/${detalleId}`, data).then((r: any) => r.data),
  removeDetalle: (pedidoId: number, detalleId: number) =>
    api.delete(`/pedidos/${pedidoId}/detalles/${detalleId}`).then((r: any) => r.data),
  checkout: (id: number, data: { tipo_comprobante: string; metodo_pago: string; monto_recibido?: number; descuento?: number; propina?: number }) =>
    api.post<Pedido>(`/pedidos/${id}/checkout`, data).then((r: any) => r.data),
  cancelar: (id: number) => api.post<Pedido>(`/pedidos/${id}/cancelar`).then((r: any) => r.data),
};

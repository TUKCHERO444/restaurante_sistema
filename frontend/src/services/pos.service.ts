import { api } from '../lib/api';
import type { PedidoPos, PedidoDetalle, CobroRequest, CobroResponse, ClientePos } from '../types';

export const posService = {
  /** Obtiene las mesas con su estado en vivo para el mapa POS. */
  async mapaMesas(): Promise<Array<{ mesa: any; estado: 'libre' | 'ocupada' | 'reservada' }>> {
    const { data } = await api.get('/pos/mapa-mesas');
    return data;
  },

  /** Obtiene los datos completos de la pantalla de pedido por mesa. */
  async obtenerPedido(mesaId: number): Promise<{
    mesa: any;
    pedido: PedidoPos | null;
    detalles: PedidoDetalle[];
    mesasLibres: any[];
  }> {
    const { data } = await api.get(`/pos/mesa/${mesaId}`);
    return data;
  },

  /** Obtiene categorías con productos activos y vendibles. */
  async categoriasConProductos(): Promise<Array<{ id: number; nombre: string; productos: any[] }>> {
    const { data } = await api.get('/pos/categorias');
    return data;
  },

  /** Agrega un producto al pedido de la mesa (crea orden si no existe). */
  async agregarProducto(pedidoId: number | null, mesaId: number, productoId: number, cantidad = 1): Promise<PedidoPos> {
    const { data } = await api.post(`/pos/pedido/${mesaId}/agregar`, {
      producto_id: productoId,
      cantidad,
      pedido_id: pedidoId,
    });
    return data;
  },

  /** Actualiza la cantidad de una línea del carrito. */
  async actualizarCantidad(detalleId: number, cantidad: number): Promise<PedidoDetalle> {
    const { data } = await api.put(`/pos/detalle/${detalleId}/cantidad`, { cantidad });
    return data;
  },

  /** Guarda una nota de cocina para una línea. */
  async guardarNota(detalleId: number, nota: string): Promise<PedidoDetalle> {
    const { data } = await api.put(`/pos/detalle/${detalleId}/nota`, { nota });
    return data;
  },

  /** Elimina una línea del carrito. */
  async eliminarLinea(detalleId: number): Promise<void> {
    await api.delete(`/pos/detalle/${detalleId}`);
  },

  /** Aplica descuento o propina al pedido. */
  async aplicarOpciones(pedidoId: number, descuento: number, propina: number): Promise<PedidoPos> {
    const { data } = await api.post(`/pos/pedido/${pedidoId}/opciones`, {
      descuento,
      propina,
    });
    return data;
  },

  /** Mueve el pedido a otra mesa libre. */
  async moverMesa(pedidoId: number, nuevaMesaId: number): Promise<PedidoPos> {
    const { data } = await api.post(`/pos/pedido/${pedidoId}/mover-mesa`, {
      mesa_id: nuevaMesaId,
    });
    return data;
  },

  /** Procesa el cobro del pedido. */
  async cobrar(pedidoId: number, datos: CobroRequest): Promise<CobroResponse> {
    const { data } = await api.post(`/pos/pedido/${pedidoId}/cobrar`, datos);
    return data;
  },

  /** Busca clientes por nombre o documento. */
  async buscarClientes(query: string): Promise<ClientePos[]> {
    const { data } = await api.get('/pos/clientes', { params: { q: query } });
    return data;
  },
};

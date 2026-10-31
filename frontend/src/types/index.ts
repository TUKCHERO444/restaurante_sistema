// ============================================================================
// TIPOS DEL DOMINIO — Sistema Restaurante
// ============================================================================

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'administrador' | 'cajero' | 'mozo' | 'cocina';
  correo_verificado_en: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface Area {
  id: number;
  nombre: string;
  creado_en: string;
  actualizado_en: string;
}

export interface Mesa {
  id: number;
  area_id: number;
  nombre: string;
  asientos: number;
  estado: 'libre' | 'ocupada' | 'reservada';
  pos_x: number;
  pos_y: number;
  creado_en: string;
  actualizado_en: string;
  area?: Area;
}

export interface Categoria {
  id: number;
  nombre: string;
  imagen: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  codigo: string | null;
  codigo_barras: string | null;
  precio: number;
  precio_promocional: number | null;
  costo: number | null;
  stock: number | null;
  vendible: boolean;
  imagen: string | null;
  activo: boolean;
  recomendado_chef: boolean;
  nuevo: boolean;
  creado_en: string;
  actualizado_en: string;
  categoria?: Categoria;
}

export interface Cliente {
  id: number;
  nombre: string;
  tipo_documento: string;
  numero_documento: string | null;
  correo: string | null;
  telefono: string | null;
  direccion: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface Reserva {
  id: number;
  nombre_cliente: string;
  telefono: string | null;
  fecha_reserva: string;
  personas: number;
  mesa_id: number | null;
  nota: string | null;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  creado_en: string;
  actualizado_en: string;
  mesa?: Mesa;
}

export interface Pedido {
  id: number;
  mesa_id: number | null;
  usuario_id: number;
  cliente_id: number | null;
  caja_id: number | null;
  estado: 'pendiente' | 'completada' | 'anulada';
  total: number;
  subtotal: number;
  igv: number;
  total_gravado: number;
  total_exonerado: number;
  total_inafecto: number;
  total_gratuito: number;
  descuento: number;
  propina: number;
  metodo_pago: string;
  monto_recibido: number | null;
  vuelto: number;
  tipo_comprobante: 'ticket' | 'boleta' | 'factura';
  nombre_cliente: string;
  documento_cliente: string | null;
  serie: string | null;
  correlativo: number | null;
  estado_sunat: string;
  codigo_sunat: string | null;
  descripcion_sunat: string | null;
  ruta_xml: string | null;
  ruta_cdr: string | null;
  ruta_pdf: string | null;
  hash: string | null;
  enviado_en: string | null;
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
  mesa?: Mesa;
  usuario?: Usuario;
  cliente?: Cliente;
  detalles?: PedidoDetalle[];
}

export interface PedidoDetalle {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio: number;
  nota: string | null;
  estado: 'pendiente' | 'en_cocina' | 'servido';
  creado_en: string;
  actualizado_en: string;
  producto?: Producto;
}

// ============================================================================
// TIPOS DEL MÓDULO POS
// ============================================================================

export interface PedidoPos extends Pedido {
  detalles: PedidoDetalle[];
}

export interface CarritoLinea {
  detalle: PedidoDetalle;
  producto: Producto;
  subtotal: number;
}

export interface ClientePos {
  id: number;
  nombre: string;
  documento: string | null;
}

export interface CobroRequest {
  cliente_id: number | null;
  nombre_cliente: string;
  documento_cliente: string | null;
  tipo_comprobante: 'ticket' | 'boleta' | 'factura';
  metodo_pago: 'efectivo' | 'tarjeta';
  monto_recibido: number;
  descuento?: number;
  propina?: number;
}

export interface CobroResponse {
  pedido: Pedido;
  mensaje: string;
}

export interface Caja {
  id: number;
  usuario_id: number;
  apertura_en: string;
  cierre_en: string | null;
  monto_apertura: number;
  monto_cierre: number | null;
  monto_esperado: number | null;
  diferencia: number | null;
  estado: 'abierta' | 'cerrada';
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
  usuario?: Usuario;
  pedidos?: Pedido[];
  gastos?: Gasto[];
}

export interface Gasto {
  id: number;
  concepto: string;
  monto: number;
  usuario_id: number;
  caja_id: number | null;
  creado_en: string;
  actualizado_en: string;
  usuario?: Usuario;
  caja?: Caja;
}

export interface MovimientoInventario {
  id: number;
  producto_id: number;
  usuario_id: number;
  tipo: 'venta' | 'compra' | 'ajuste';
  cantidad: number;
  stock_anterior: number | null;
  stock_nuevo: number | null;
  nota: string | null;
  creado_en: string;
  actualizado_en: string;
  producto?: Producto;
  usuario?: Usuario;
}

export interface Repartidor {
  id: number;
  nombre: string;
  telefono: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Reparto {
  id: number;
  pedido_id: number;
  cliente_id: number | null;
  nombre_cliente: string;
  telefono_cliente: string;
  direccion: string;
  referencia: string | null;
  repartidor_id: number | null;
  usuario_id: number;
  caja_id: number | null;
  estado: 'pendiente' | 'en_preparacion' | 'en_camino' | 'entregado' | 'cancelado';
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
  costo_envio: number;
  notas: string | null;
  programado_para: string | null;
  entregado_en: string | null;
  creado_en: string;
  actualizado_en: string;
  pedido?: Pedido;
  cliente?: Cliente;
  repartidor?: Repartidor;
  usuario?: Usuario;
}

export interface Configuracion {
  id: number;
  clave: string;
  valor: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface SerieDocumento {
  id: number;
  codigo_documento: string;
  tipo_documento: string;
  serie: string;
  ultimo_numero: number;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface NotaCredito {
  id: number;
  pedido_id: number;
  serie: string;
  correlativo: number;
  tipo_documento: string;
  codigo_motivo: string;
  descripcion_motivo: string;
  subtotal: number;
  igv: number;
  total: number;
  estado_sunat: string;
  codigo_sunat: string | null;
  descripcion_sunat: string | null;
  ruta_xml: string | null;
  ruta_cdr: string | null;
  ruta_pdf: string | null;
  hash: string | null;
  enviado_en: string | null;
  usuario_id: number | null;
  creado_en: string;
  actualizado_en: string;
  pedido?: Pedido;
  usuario?: Usuario;
}

export interface ResumenDiario {
  id: number;
  fecha_referencia: string;
  fecha_generacion: string;
  correlativo: number;
  identificador: string;
  total_documentos: number;
  monto_total: number;
  estado_sunat: string;
  ticket: string | null;
  codigo_sunat: string | null;
  descripcion_sunat: string | null;
  ruta_xml: string | null;
  ruta_cdr: string | null;
  hash: string | null;
  enviado_en: string | null;
  consultado_en: string | null;
  usuario_id: number | null;
  creado_en: string;
  actualizado_en: string;
  usuario?: Usuario;
}

// ============================================================================
// TIPOS DE API
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

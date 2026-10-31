/**
 * Configuración de navegación del panel.
 * Define los módulos principales y sus metadatos para breadcrumb y título.
 */

export interface Modulo {
  ruta: string;
  label: string;
}

export const MODULOS: Modulo[] = [
  { ruta: '/admin', label: 'Dashboard' },
  { ruta: '/admin/usuarios', label: 'Usuarios' },
  { ruta: '/admin/mesas', label: 'Diseño de Salón' },
  { ruta: '/admin/pos', label: 'Punto de Venta' },
  { ruta: '/admin/categorias', label: 'Categorías' },
  { ruta: '/admin/productos', label: 'Productos' },
  { ruta: '/admin/clientes', label: 'Clientes' },
  { ruta: '/admin/reservas', label: 'Reservas' },
  { ruta: '/admin/pedidos', label: 'Pedidos' },
  { ruta: '/admin/cajas', label: 'Cajas' },
  { ruta: '/admin/gastos', label: 'Gastos' },
  { ruta: '/admin/repartidores', label: 'Repartidores' },
  { ruta: '/admin/repartos', label: 'Repartos' },
  { ruta: '/admin/movimientos', label: 'Inventario' },
  { ruta: '/admin/configuraciones', label: 'Configuración' },
  { ruta: '/admin/series', label: 'Series' },
  { ruta: '/admin/notas-credito', label: 'Notas de Crédito' },
  { ruta: '/admin/resumenes', label: 'Resúmenes Diarios' },
];

/**
 * Obtiene el módulo correspondiente a una ruta.
 * Si no coincide exactamente, busca el módulo padre más cercano.
 */
export function obtenerModulo(pathname: string): Modulo {
  // Coincidencia exacta
  const exacto = MODULOS.find((m) => m.ruta === pathname);
  if (exacto) return exacto;

  // Coincidencia por prefijo (rutas hijas)
  const porPrefijo = MODULOS.filter((m) => pathname.startsWith(`${m.ruta}/`));
  if (porPrefijo.length > 0) {
    // El más específico (ruta más larga)
    return porPrefijo.sort((a, b) => b.ruta.length - a.ruta.length)[0];
  }

  // Fallback: Dashboard
  return MODULOS[0];
}

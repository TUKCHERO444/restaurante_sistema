import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SidebarHeader } from '@/components/SidebarHeader';
import { LayoutDashboard, Users, UtensilsCrossed, Tag, Package, UserCheck, Calendar, ShoppingCart, DollarSign, TrendingUp, Truck, ClipboardList, Settings, FileText, CreditCard, BarChart3 } from 'lucide-react';
import { MODULOS, type Modulo } from '@/config/navigation';

const ICONOS: Record<string, React.ComponentType<{ className?: string }>> = {
  '/admin': LayoutDashboard,
  '/admin/usuarios': Users,
  '/admin/mesas': UtensilsCrossed,
  '/admin/categorias': Tag,
  '/admin/productos': Package,
  '/admin/clientes': UserCheck,
  '/admin/reservas': Calendar,
  '/admin/pedidos': ShoppingCart,
  '/admin/cajas': DollarSign,
  '/admin/gastos': TrendingUp,
  '/admin/repartidores': Truck,
  '/admin/repartos': ClipboardList,
  '/admin/movimientos': ClipboardList,
  '/admin/configuraciones': Settings,
  '/admin/series': FileText,
  '/admin/notas-credito': CreditCard,
  '/admin/resumenes': BarChart3,
};
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface SidebarProps {
  /** Colapsado a modo icono. Sólo aplica en escritorio (>= 768px). */
  colapsado: boolean;
  onAlternarColapso: () => void;
  /** Cajón superpuesto visible en móvil (< 768px). */
  sidebarMovilAbierto: boolean;
  /** Cierra el cajón superpuesto (móvil). */
  onCerrarMovil: () => void;
}

/**
 * Sidebar de navegación principal (AdminLTE).
 *
 * - Escritorio: fijo, con ancho completo o colapsado a modo icono.
 * - Móvil: cajón superpuesto, cerrado por defecto. Se abre con el botón
 *   hamburguesa de la navbar y se contrae solo al cambiar de módulo.
 */
export function Sidebar({
  colapsado,
  onAlternarColapso,
  sidebarMovilAbierto,
  onCerrarMovil,
}: SidebarProps) {
  const esMovil = useMediaQuery('(max-width: 767px)');
  const fueraDePantalla = esMovil && !sidebarMovilAbierto;

  return (
    <aside
      id="sidebar-principal"
      aria-label="Navegación principal"
      inert={fueraDePantalla ? true : undefined}
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200',
        colapsado ? 'md:w-16' : 'md:w-64',
        sidebarMovilAbierto ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
      )}
    >
      {/* Cabecera inyectada automáticamente: marca + botón de cierre del cajón */}
      <SidebarHeader colapsado={colapsado} onCerrar={onCerrarMovil} />

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Módulos">
        <ul className="flex flex-col gap-1">
          {MODULOS.map((item: Modulo) => (
            <li key={item.ruta}>
              <NavLink
                to={item.ruta}
                end={item.ruta === '/admin'}
                onClick={onCerrarMovil}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-sidebar-accent text-white'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/20 hover:text-white',
                    colapsado && 'md:justify-center md:px-0',
                  )
                }
                title={colapsado ? item.label : undefined}
              >
                {(() => {
                  const Icono = ICONOS[item.ruta] ?? LayoutDashboard;
                  return <Icono className="size-5 shrink-0" aria-hidden />;
                })()}
                <span className={cn(colapsado && 'md:hidden')}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botón colapsar (escritorio) */}
      <div className="hidden border-t border-sidebar-border p-2 md:block">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAlternarColapso}
          className="w-full justify-center text-sidebar-foreground/80 hover:bg-sidebar-accent/20 hover:text-white"
          aria-label={colapsado ? 'Expandir menú' : 'Contraer menú'}
        >
          {colapsado ? (
            <ChevronRight className="size-4" aria-hidden />
          ) : (
            <>
              <ChevronLeft className="size-4" aria-hidden />
              <span>Contraer</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

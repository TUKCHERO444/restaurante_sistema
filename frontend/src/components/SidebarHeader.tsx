import { X, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  /** Colapsado a modo icono. Sólo aplica en escritorio (>= 768px). */
  colapsado: boolean;
  /** Cierra el cajón superpuesto del sidebar en móvil. */
  onCerrar: () => void;
}

/**
 * Encabezado del sidebar inyectado automáticamente en la parte superior.
 *
 * - Muestra la marca del sistema.
 * - Incluye el botón X para cerrar el cajón en móvil. Su estilo es
 *   deliberadamente distinto al de los enlaces de módulo (filas de texto
 *   con icono y fondo sólo al estar activo): es un botón circular con
 *   borde, para que nunca se confunda con un cambio de módulo.
 */
export function SidebarHeader({ colapsado, onCerrar }: SidebarHeaderProps) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border px-4">
      <div
        className={cn(
          'flex min-w-0 items-center gap-2',
          colapsado && 'md:justify-center md:w-full',
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-white">
          <UtensilsCrossed className="size-4" aria-hidden />
        </span>
        <span className={cn('truncate text-sm font-semibold', colapsado && 'md:hidden')}>
          Restaurante
        </span>
      </div>

      {/*
        Botón de cierre del cajón: sólo visible en móvil (< md).
        Estilo propio (circular con borde) para no confundirse con un módulo.
      */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onCerrar}
        className="shrink-0 rounded-full border-sidebar-border bg-sidebar-accent/15 text-sidebar-foreground hover:bg-sidebar-accent/30 hover:text-white md:hidden"
        aria-label="Cerrar menú de navegación"
        title="Cerrar menú"
      >
        <X className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

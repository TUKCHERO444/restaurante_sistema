import { cn } from '@/lib/utils';
import { Monitor, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MesaPosCardProps {
  mesa: { id: number; nombre: string; pos_x: number; pos_y: number; area?: { nombre: string } };
  estado: 'libre' | 'ocupada' | 'reservada';
  total?: number;
  onClic: () => void;
}

const ESTADOS = {
  libre: {
    borde: 'border-success',
    fondo: 'bg-card',
    icono: 'text-success',
    badge: 'default' as const,
    badgeTexto: 'Libre',
    badgeVariant: 'success' as const,
  },
  ocupada: {
    borde: 'border-destructive',
    fondo: 'bg-card',
    icono: 'text-destructive',
    badge: 'CONSUMO',
    badgeVariant: 'destructive' as const,
  },
  reservada: {
    borde: 'border-warning',
    fondo: 'bg-card',
    icono: 'text-muted-foreground',
    badge: 'RESERVA',
    badgeVariant: 'warning' as const,
  },
};

/**
 * Tarjeta de mesa en el mapa POS.
 * Color de borde según estado: verde (libre), rojo (consumo), amarillo (reserva).
 */
export function MesaPosCard({ mesa, estado, total, onClic }: MesaPosCardProps) {
  const config = ESTADOS[estado];

  return (
    <button
      type="button"
      onClick={onClic}
      aria-label={`Mesa ${mesa.nombre} — estado ${config.badge}`}
      className={cn(
        'absolute flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-2 text-center transition-shadow',
        'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        config.borde,
        config.fondo,
      )}
      style={{
        left: mesa.pos_x,
        top: mesa.pos_y,
        width: 110,
        height: 110,
      }}
    >
      <Monitor className={cn('size-6', config.icono)} aria-hidden />
      <span className="mt-1 text-xs font-semibold text-card-foreground">
        {mesa.nombre}
      </span>
      <Badge variant={config.badgeVariant} className="mt-1 text-[10px]">
        {config.badge}
      </Badge>
      {estado === 'ocupada' && total !== undefined && (
        <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">
          S/ {total.toFixed(2)}
        </span>
      )}
      {estado === 'reservada' && (
        <Clock className="mt-0.5 size-3 text-muted-foreground" aria-hidden />
      )}
    </button>
  );
}

import { useRef, useState, useCallback } from 'react';
import type { Mesa } from '../types';
import { cn } from '@/lib/utils';

interface MesaCanvasProps {
  mesas: Mesa[];
  onPositionChange: (id: number, x: number, y: number) => void;
  onSelectMesa: (mesa: Mesa) => void;
  selectedMesaId: number | null;
}

const MESA_SIZE = 80;
const GRID_SIZE = 20;

/**
 * Lienzo del salón con mesas arrastrables.
 * Usa Pointer Events para soportar mouse y táctil.
 */
export function MesaCanvas({ mesas, onPositionChange, onSelectMesa, selectedMesaId }: MesaCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: number; offsetX: number; offsetY: number } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, mesa: Mesa) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - mesa.pos_x;
      const offsetY = e.clientY - rect.top - mesa.pos_y;

      setDragging({ id: mesa.id, offsetX, offsetY });
      onSelectMesa(mesa);

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [onSelectMesa],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      let x = e.clientX - rect.left - dragging.offsetX;
      let y = e.clientY - rect.top - dragging.offsetY;

      // Acotar a los límites del lienzo
      x = Math.max(0, Math.min(x, rect.width - MESA_SIZE));
      y = Math.max(0, Math.min(y, rect.height - MESA_SIZE));

      onPositionChange(dragging.id, Math.round(x), Math.round(y));
    },
    [dragging, onPositionChange],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  return (
    <div
      ref={canvasRef}
      className="relative h-[500px] w-full overflow-hidden rounded-lg border border-border bg-card"
      style={{
        backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        touchAction: 'none',
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {mesas.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No hay mesas en esta área. Crea una para comenzar.
          </p>
        </div>
      )}

      {mesas.map((mesa) => (
        <div
          key={mesa.id}
          role="button"
          tabIndex={0}
          aria-label={`Mesa ${mesa.nombre}`}
          className={cn(
            'absolute flex cursor-grab flex-col items-center justify-center rounded-md border-2 text-xs font-medium select-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'transition-shadow',
            selectedMesaId === mesa.id
              ? 'border-primary bg-primary/10 shadow-md'
              : 'border-border bg-card hover:shadow-sm',
            dragging?.id === mesa.id && 'cursor-grabbing shadow-lg',
          )}
          style={{
            left: mesa.pos_x,
            top: mesa.pos_y,
            width: MESA_SIZE,
            height: MESA_SIZE,
            zIndex: dragging?.id === mesa.id ? 100 : 1,
          }}
          onPointerDown={(e) => handlePointerDown(e, mesa)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectMesa(mesa);
            }
          }}
        >
          <span className="truncate px-1 text-[10px]">{mesa.nombre}</span>
        </div>
      ))}
    </div>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { posService } from '../services/pos.service';
import { MesaPosCard } from '../components/pos/MesaPosCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Area, Mesa } from '@/types';

interface MesaConEstado {
  mesa: Mesa & { area?: Area };
  estado: 'libre' | 'ocupada' | 'reservada';
  total?: number;
}

/**
 * Vista 1 del POS — Mapa de mesas con estado en vivo.
 * Pestañas por área + mesas posicionadas con color por estado.
 */
export function PosMapaPage() {
  const navigate = useNavigate();
  const [areaSeleccionada, setAreaSeleccionada] = useState<number | null>(null);

  const { data: mesasData, isLoading } = useQuery({
    queryKey: ['pos-mapa-mesas'],
    queryFn: () => posService.mapaMesas(),
    refetchInterval: 5000,
  });

  const mesas: MesaConEstado[] = mesasData ?? [];

  // Obtener áreas únicas de las mesas
  const areas = Array.from(
    new Map(
      mesas
        .filter((m) => m.mesa.area)
        .map((m) => [m.mesa.area!.id, m.mesa.area!]),
    ).values(),
  );

  const mesasFiltradas = areaSeleccionada
    ? mesas.filter((m) => m.mesa.area_id === areaSeleccionada)
    : mesas;

  const conteoEstados = {
    libre: mesas.filter((m) => m.estado === 'libre').length,
    reservada: mesas.filter((m) => m.estado === 'reservada').length,
    ocupada: mesas.filter((m) => m.estado === 'ocupada').length,
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            Mapa de mesas
          </h2>
          <p className="text-sm text-muted-foreground">
            Selecciona una mesa para tomar el pedido
          </p>
        </div>
        {/* Leyenda */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-sm border-2 border-success" aria-hidden />
            Libre ({conteoEstados.libre})
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-sm border-2 border-warning" aria-hidden />
            Reservada ({conteoEstados.reservada})
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-sm border-2 border-destructive" aria-hidden />
            Ocupada ({conteoEstados.ocupada})
          </span>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <>
          {/* Pestañas de áreas */}
          {areas.length > 1 && (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Áreas">
              <button
                type="button"
                role="tab"
                aria-selected={areaSeleccionada === null}
                onClick={() => setAreaSeleccionada(null)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  areaSeleccionada === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                Todas
              </button>
              {areas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  role="tab"
                  aria-selected={areaSeleccionada === area.id}
                  onClick={() => setAreaSeleccionada(area.id)}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    areaSeleccionada === area.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent'
                  }`}
                >
                  {area.nombre}
                </button>
              ))}
            </div>
          )}

          {/* Lienzo del mapa */}
          <div
            className="relative flex-1 overflow-auto rounded-lg border border-border bg-card"
            style={{
              backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              minHeight: 500,
            }}
          >
            {mesasFiltradas.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No hay mesas en esta área.
                </p>
              </div>
            ) : (
              mesasFiltradas.map(({ mesa, estado, total }) => (
                <MesaPosCard
                  key={mesa.id}
                  mesa={mesa}
                  estado={estado}
                  total={total}
                  onClic={() => navigate(`/admin/pos/mesa/${mesa.id}`)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

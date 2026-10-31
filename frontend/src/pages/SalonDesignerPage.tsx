import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { areasService } from '../services/areas.service';
import { mesasService } from '../services/mesas.service';
import { MesaCanvas } from '../components/MesaCanvas';
import { GestorAreas } from '../components/GestorAreas';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Area, Mesa } from '../types';

/**
 * Página de Diseño de Salón — CRUD fusionado de áreas y mesas.
 *
 * Permite crear/eliminar áreas, agregar/eliminar mesas y
 * posicionarlas visualmente mediante arrastre (Pointer Events).
 * Las coordenadas se guardan en el backend con "Guardar posiciones".
 */
export function SalonDesignerPage() {
  const queryClient = useQueryClient();
  const [areaSeleccionada, setAreaSeleccionada] = useState<number | null>(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<number | null>(null);
  // Posiciones modificadas localmente (arrastres aún sin guardar).
  const [posicionesEditadas, setPosicionesEditadas] = useState<
    Map<number, { x: number; y: number }>
  >(new Map());

  // Dialogs
  const [areaDialogAbierto, setAreaDialogAbierto] = useState(false);
  const [mesaDialogAbierto, setMesaDialogAbierto] = useState(false);
  const [eliminarAreaDialog, setEliminarAreaDialog] = useState(false);
  const [eliminarMesaDialog, setEliminarMesaDialog] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Form state
  const [nombreArea, setNombreArea] = useState('');

  // Queries
  const { data: areasData, isLoading: areasLoading } = useQuery({
    queryKey: ['areas'],
    queryFn: () => areasService.getAll({ per_page: 500 }),
  });

  const { data: mesasData, isLoading: mesasLoading } = useQuery({
    queryKey: ['mesas'],
    queryFn: () => mesasService.getAll({ per_page: 500 }),
  });

  const areas: Area[] = useMemo(() => areasData?.data ?? [], [areasData]);
  const mesas: Mesa[] = useMemo(() => mesasData?.data ?? [], [mesasData]);

  // Vista combinada de posiciones: la del servidor con las modificaciones
  // locales (arrastres sin guardar) aplicadas por encima.
  const posiciones = useMemo(() => {
    const map = new Map<number, { x: number; y: number }>();
    mesas.forEach((m: Mesa) => map.set(m.id, { x: m.pos_x, y: m.pos_y }));
    posicionesEditadas.forEach((pos, id) => map.set(id, pos));
    return map;
  }, [mesas, posicionesEditadas]);

  const areaActual = areas.find((a: Area) => a.id === areaSeleccionada) ?? null;
  const mesasArea = mesas.filter((m: Mesa) => m.area_id === areaSeleccionada);
  const mesaAEliminar = mesas.find((m: Mesa) => m.id === mesaSeleccionada) ?? null;

  // Mutations
  const crearAreaMutation = useMutation({
    mutationFn: () => areasService.create({ nombre: nombreArea }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast.success('Área creada exitosamente');
      setNombreArea('');
      setAreaDialogAbierto(false);
    },
    onError: () => toast.error('Error al crear el área'),
  });

  const eliminarAreaMutation = useMutation({
    mutationFn: (id: number) => areasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
      toast.success('Área eliminada exitosamente');
      setAreaSeleccionada(null);
      setEliminarAreaDialog(false);
    },
    onError: () => toast.error('No se puede eliminar: tiene mesas asociadas'),
  });

  const crearMesaMutation = useMutation({
    mutationFn: (data: { nombre: string; area_id: number }) => mesasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
      toast.success('Mesa creada exitosamente');
    },
    onError: () => toast.error('Error al crear la mesa'),
  });

  const eliminarMesaMutation = useMutation({
    mutationFn: (id: number) => mesasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
      toast.success('Mesa eliminada exitosamente');
      setMesaSeleccionada(null);
      setEliminarMesaDialog(false);
    },
    onError: () => toast.error('Error al eliminar la mesa'),
  });

  const guardarPosicionesMutation = useMutation({
    mutationFn: async () => {
      const posicionesArray = Array.from(posiciones.entries()).map(([id, pos]) => ({
        id,
        x: pos.x,
        y: pos.y,
      }));
      // Filtrar solo mesas del área actual
      const mesasAreaIds = mesasArea.map((m) => m.id);
      return mesasService.updatePositions(posicionesArray.filter((p) => mesasAreaIds.includes(p.id)));
    },
    onSuccess: () => {
      toast.success('Posiciones guardadas correctamente');
      setGuardando(false);
    },
    onError: () => {
      toast.error('Error al guardar las posiciones');
      setGuardando(false);
    },
  });

  const handlePositionChange = useCallback((id: number, x: number, y: number) => {
    setPosicionesEditadas((prev) => new Map(prev).set(id, { x, y }));
  }, []);

  const handleCrearArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreArea.trim()) return;
    crearAreaMutation.mutate();
  };

  const handleNuevaMesa = (nombre: string) => {
    if (!areaSeleccionada) return;
    crearMesaMutation.mutate({ nombre, area_id: areaSeleccionada });
    setMesaDialogAbierto(false);
  };

  const handleGuardarPosiciones = () => {
    setGuardando(true);
    guardarPosicionesMutation.mutate();
  };

  if (areasLoading || mesasLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando diseño de salón...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Diseño de Salón"
        description="Crea áreas, agrega mesas y define la distribución del restaurante arrastrando cada mesa a su posición."
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Diseño de Salón' }]}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAreaDialogAbierto(true)}
            >
              <Plus className="mr-2 size-4" aria-hidden />
              Nueva área
            </Button>
            <Button
              type="button"
              onClick={handleGuardarPosiciones}
              disabled={guardando}
            >
              <Save className="mr-2 size-4" aria-hidden />
              {guardando ? 'Guardando...' : 'Guardar posiciones'}
            </Button>
          </>
        }
      />

      {areas.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No hay áreas creadas. Crea la primera para comenzar.
            </p>
            <Button
              type="button"
              className="mt-4"
              onClick={() => setAreaDialogAbierto(true)}
            >
              <Plus className="mr-2 size-4" aria-hidden />
              Crear área
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Panel lateral: áreas + mesas */}
          <div className="flex flex-col gap-4">
            {/* Tabs de áreas */}
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border p-4">
                <h3 className="font-heading text-sm font-semibold text-card-foreground">
                  Áreas del salón
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 p-4" role="tablist" aria-label="Áreas">
                {areas.map((area: Area) => (
                  <button
                    key={area.id}
                    type="button"
                    role="tab"
                    aria-selected={areaSeleccionada === area.id}
                    onClick={() => {
                      setAreaSeleccionada(area.id);
                      setMesaSeleccionada(null);
                    }}
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
            </div>

            {/* Gestor de mesas del área */}
            <div className="min-h-[300px] rounded-lg border border-border bg-card">
              <GestorAreas
                area={areaActual}
                mesas={mesasArea}
                onEliminarArea={() => setEliminarAreaDialog(true)}
                onNuevaMesa={handleNuevaMesa}
                onEliminarMesa={(id) => {
                  setMesaSeleccionada(id);
                  setEliminarMesaDialog(true);
                }}
                mesaDialogAbierto={mesaDialogAbierto}
                onMesaDialogChange={setMesaDialogAbierto}
              />
            </div>
          </div>

          {/* Lienzo del salón */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Arrastra las mesas para definir su posición en el plano
              </p>
              <span className="text-xs text-muted-foreground">
                {mesasArea.length} {mesasArea.length === 1 ? 'mesa' : 'mesas'}
              </span>
            </div>
            <MesaCanvas
              mesas={mesasArea.map((m: Mesa) => ({
                ...m,
                pos_x: posiciones.get(m.id)?.x ?? m.pos_x,
                pos_y: posiciones.get(m.id)?.y ?? m.pos_y,
              }))}
              onPositionChange={handlePositionChange}
              onSelectMesa={(mesa) => setMesaSeleccionada(mesa.id)}
              selectedMesaId={mesaSeleccionada}
            />
          </div>
        </div>
      )}

      {/* Dialog nueva área */}
      <Dialog open={areaDialogAbierto} onOpenChange={setAreaDialogAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva área</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCrearArea} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre-area">Nombre del área</Label>
              <Input
                id="nombre-area"
                value={nombreArea}
                onChange={(e) => setNombreArea(e.target.value)}
                placeholder="Ej: Terraza, Salón Principal"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAreaDialogAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={crearAreaMutation.isPending}>
                {crearAreaMutation.isPending ? 'Creando...' : 'Crear área'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmación eliminar área */}
      <ConfirmDialog
        open={eliminarAreaDialog}
        onOpenChange={setEliminarAreaDialog}
        title="Eliminar área"
        description={`¿Está seguro de eliminar el área "${areaActual?.nombre}"? Se eliminarán también todas sus mesas. Esta acción no se puede deshacer.`}
        onConfirm={() => areaActual && eliminarAreaMutation.mutate(areaActual.id)}
        loading={eliminarAreaMutation.isPending}
      />

      {/* Confirmación eliminar mesa */}
      <ConfirmDialog
        open={eliminarMesaDialog}
        onOpenChange={setEliminarMesaDialog}
        title="Eliminar mesa"
        description={`¿Está seguro de eliminar la mesa "${mesaAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={() => mesaAEliminar && eliminarMesaMutation.mutate(mesaAEliminar.id)}
        loading={eliminarMesaMutation.isPending}
      />
    </div>
  );
}

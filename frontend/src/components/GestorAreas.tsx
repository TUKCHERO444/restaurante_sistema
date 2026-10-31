import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import type { Area, Mesa } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

interface GestorAreasProps {
  area: Area | null;
  mesas: Mesa[];
  onEliminarArea: () => void;
  onNuevaMesa: (nombre: string) => void;
  onEliminarMesa: (id: number) => void;
  mesaDialogAbierto: boolean;
  onMesaDialogChange: (open: boolean) => void;
}

/**
 * Panel lateral de gestión de mesas del área seleccionada.
 * Lista mesas, permite crear y eliminar.
 */
export function GestorAreas({
  area,
  mesas,
  onEliminarArea,
  onNuevaMesa,
  onEliminarMesa,
  mesaDialogAbierto,
  onMesaDialogChange,
}: GestorAreasProps) {
  const [nombreMesa, setNombreMesa] = useState('');

  if (!area) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Selecciona un área para gestionar sus mesas.
        </p>
      </div>
    );
  }

  const handleCrearMesa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreMesa.trim()) return;
    onNuevaMesa(nombreMesa.trim());
    setNombreMesa('');
    onMesaDialogChange(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <h3 className="font-heading text-sm font-semibold text-card-foreground">
          Mesas del área
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {mesas.length} {mesas.length === 1 ? 'mesa' : 'mesas'} en &quot;{area.nombre}&quot;
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {mesas.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay mesas en esta área.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {mesas.map((mesa) => (
              <li
                key={mesa.id}
                className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2"
              >
                <span className="text-sm text-card-foreground">{mesa.nombre}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onEliminarMesa(mesa.id)}
                  aria-label={`Eliminar mesa ${mesa.nombre}`}
                  className="size-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-border p-4">
        <Button
          type="button"
          onClick={() => {
            onMesaDialogChange(true);
          }}
          className="w-full"
        >
          <Plus className="mr-2 size-4" aria-hidden />
          Nueva mesa
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onEliminarArea}
          className="w-full"
        >
          <Trash2 className="mr-2 size-4" aria-hidden />
          Eliminar área
        </Button>
      </div>

      {/* Dialog nueva mesa */}
      <Dialog open={mesaDialogAbierto} onOpenChange={onMesaDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva mesa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCrearMesa} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre-mesa">Nombre</Label>
              <Input
                id="nombre-mesa"
                value={nombreMesa}
                onChange={(e) => setNombreMesa(e.target.value)}
                placeholder="Ej: Mesa 1"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onMesaDialogChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear mesa</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

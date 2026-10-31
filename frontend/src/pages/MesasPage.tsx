import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { mesasService } from '../services/mesas.service';
import { areasService } from '../services/areas.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputField, SelectField } from '../components/FormField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { StatusBadge } from '../components/StatusBadge';
import type { Mesa } from '../types';

export function MesasPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Mesa | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Mesa | null>(null);
  const [form, setForm] = useState({ area_id: '', nombre: '', asientos: 4, estado: 'libre' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: mesasData, isLoading } = useQuery({
    queryKey: ['mesas'],
    queryFn: () => mesasService.getAll(),
  });

  const { data: areasData } = useQuery({
    queryKey: ['areas'],
    queryFn: () => areasService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Mesa>) => mesasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
      toast.success('Mesa creada exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear mesa');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Mesa> }) => mesasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
      toast.success('Mesa actualizada exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar mesa');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mesasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
      toast.success('Mesa eliminada exitosamente');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'No se puede eliminar: tiene pedidos o reservas asociadas');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ area_id: '', nombre: '', asientos: 4, estado: 'libre' });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (mesa: Mesa) => {
    setEditing(mesa);
    setForm({ area_id: String(mesa.area_id), nombre: mesa.nombre, asientos: mesa.asientos, estado: mesa.estado });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm({ area_id: '', nombre: '', asientos: 4, estado: 'libre' });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.area_id) newErrors.area_id = 'El área es obligatoria';
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const data: Partial<Mesa> = { ...form, area_id: Number(form.area_id), estado: form.estado as 'libre' | 'ocupada' | 'reservada' };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const mesas = mesasData?.data ?? [];
  const areas = areasData?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mesas"
        description="Gestión de mesas del salón"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Mesas' }]}
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nueva mesa</Button>}
      />

      <DataTable
        data={mesas}
        loading={isLoading}
        searchKeys={['nombre']}
        emptyMessage="No hay mesas registradas"
        emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Crear mesa</Button>}
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          { key: 'nombre', header: 'Nombre', sortable: true },
          { key: 'asientos', header: 'Asientos', sortable: true },
          {
            key: 'estado',
            header: 'Estado',
            render: (mesa: Mesa) => <StatusBadge status={mesa.estado} />,
          },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-24 text-right',
            render: (mesa: Mesa) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(mesa)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(mesa)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar mesa' : 'Nueva mesa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <SelectField
              label="Área"
              value={form.area_id}
              onValueChange={(v) => setForm({ ...form, area_id: v })}
              error={errors.area_id}
              required
              placeholder="Seleccionar área"
              options={areas.map((a: any) => ({ value: String(a.id), label: a.nombre }))}
            />
            <InputField
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              error={errors.nombre}
              required
              placeholder="Ej: Mesa 1"
            />
            <InputField
              label="Asientos"
              type="number"
              min={1}
              max={50}
              value={form.asientos}
              onChange={(e) => setForm({ ...form, asientos: Number(e.target.value) })}
              required
            />
            <SelectField
              label="Estado"
              value={form.estado}
              onValueChange={(v) => setForm({ ...form, estado: v })}
              options={[
                { value: 'libre', label: 'Libre' },
                { value: 'ocupada', label: 'Ocupada' },
                { value: 'reservada', label: 'Reservada' },
              ]}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar mesa"
        description={`¿Está seguro de eliminar la mesa "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

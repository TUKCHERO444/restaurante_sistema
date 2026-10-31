import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { repartidoresService } from '../services/repartidores.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputField } from '../components/FormField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import type { Repartidor } from '../types';

export function RepartidoresPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Repartidor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Repartidor | null>(null);
  const [form, setForm] = useState({ nombre: '', telefono: '', activo: true });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['repartidores'],
    queryFn: () => repartidoresService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Repartidor>) => repartidoresService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repartidores'] });
      toast.success('Repartidor creado exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear repartidor');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Repartidor> }) => repartidoresService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repartidores'] });
      toast.success('Repartidor actualizado exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar repartidor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => repartidoresService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repartidores'] });
      toast.success('Repartidor eliminado exitosamente');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'No se puede eliminar: tiene repartos asociados');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', telefono: '', activo: true });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (repartidor: Repartidor) => {
    setEditing(repartidor);
    setForm({ nombre: repartidor.nombre, telefono: repartidor.telefono ?? '', activo: repartidor.activo });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm({ nombre: '', telefono: '', activo: true });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const repartidores = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repartidores"
        description="Gestión de repartidores de delivery"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Repartidores' }]}
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nuevo repartidor</Button>}
      />

      <DataTable
        data={repartidores}
        loading={isLoading}
        searchKeys={['nombre', 'telefono']}
        emptyMessage="No hay repartidores registrados"
        emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Crear repartidor</Button>}
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          { key: 'nombre', header: 'Nombre', sortable: true },
          { key: 'telefono', header: 'Teléfono' },
          {
            key: 'activo',
            header: 'Estado',
            render: (rep: Repartidor) => (
              <span className={rep.activo ? 'text-success' : 'text-muted-foreground'}>
                {rep.activo ? 'Activo' : 'Inactivo'}
              </span>
            ),
          },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-24 text-right',
            render: (rep: Repartidor) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(rep)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(rep)}>
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
            <DialogTitle>{editing ? 'Editar repartidor' : 'Nuevo repartidor'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              error={errors.nombre}
              required
              placeholder="Ej: Carlos García"
            />
            <InputField
              label="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Ej: 999888777"
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={form.activo}
                onCheckedChange={(v: boolean) => setForm({ ...form, activo: v })}
              />
              <Label>Activo</Label>
            </div>
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
        title="Eliminar repartidor"
        description={`¿Está seguro de eliminar al repartidor "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

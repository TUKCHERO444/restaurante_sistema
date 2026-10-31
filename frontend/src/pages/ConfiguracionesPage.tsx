import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { configuracionesService } from '../services/configuraciones.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputField, TextareaField } from '../components/FormField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import type { Configuracion } from '../types';

export function ConfiguracionesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Configuracion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Configuracion | null>(null);
  const [form, setForm] = useState({ clave: '', valor: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['configuraciones'],
    queryFn: () => configuracionesService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Configuracion>) => configuracionesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuraciones'] });
      toast.success('Configuración creada exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear configuración');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Configuracion> }) => configuracionesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuraciones'] });
      toast.success('Configuración actualizada exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar configuración');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => configuracionesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuraciones'] });
      toast.success('Configuración eliminada exitosamente');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar configuración');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ clave: '', valor: '' });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (config: Configuracion) => {
    setEditing(config);
    setForm({ clave: config.clave, valor: config.valor ?? '' });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm({ clave: '', valor: '' });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.clave.trim()) newErrors.clave = 'La clave es obligatoria';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const configuraciones = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuraciones"
        description="Configuración del sistema (empresa, SUNAT, etc.)"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Configuraciones' }]}
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nueva configuración</Button>}
      />

      <DataTable
        data={configuraciones}
        loading={isLoading}
        searchKeys={['clave', 'valor']}
        emptyMessage="No hay configuraciones registradas"
        emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Crear configuración</Button>}
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          { key: 'clave', header: 'Clave', sortable: true },
          { key: 'valor', header: 'Valor' },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-24 text-right',
            render: (config: Configuracion) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(config)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(config)}>
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
            <DialogTitle>{editing ? 'Editar configuración' : 'Nueva configuración'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Clave"
              value={form.clave}
              onChange={(e) => setForm({ ...form, clave: e.target.value })}
              error={errors.clave}
              required
              placeholder="Ej: empresa_nombre"
            />
            <TextareaField
              label="Valor"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              rows={3}
              placeholder="Valor de la configuración"
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
        title="Eliminar configuración"
        description={`¿Está seguro de eliminar la configuración "${deleteTarget?.clave}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

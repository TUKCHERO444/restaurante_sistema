import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { categoriasService } from '../services/categorias.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputField } from '../components/FormField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import type { Categoria } from '../types';

export function CategoriasPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Categoria | null>(null);
  const [form, setForm] = useState({ nombre: '', imagen: null as File | null, activo: true });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => categoriasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoría creada exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear categoría');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => categoriasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoría actualizada exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar categoría');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoría eliminada exitosamente');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'No se puede eliminar: tiene productos asociados');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', imagen: null, activo: true });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (categoria: Categoria) => {
    setEditing(categoria);
    setForm({ nombre: categoria.nombre, imagen: null, activo: categoria.activo });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm({ nombre: '', imagen: null, activo: true });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('activo', String(form.activo));
    if (form.imagen) formData.append('imagen', form.imagen);

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const categorias = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Gestión de categorías del catálogo"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Categorías' }]}
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nueva categoría</Button>}
      />

      <DataTable
        data={categorias}
        loading={isLoading}
        searchKeys={['nombre']}
        emptyMessage="No hay categorías registradas"
        emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Crear categoría</Button>}
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          { key: 'nombre', header: 'Nombre', sortable: true },
          {
            key: 'activo',
            header: 'Estado',
            render: (cat: Categoria) => (
              <span className={cat.activo ? 'text-success' : 'text-muted-foreground'}>
                {cat.activo ? 'Activo' : 'Inactivo'}
              </span>
            ),
          },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-24 text-right',
            render: (cat: Categoria) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(cat)}>
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
            <DialogTitle>{editing ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              error={errors.nombre}
              required
              placeholder="Ej: Bebidas"
            />
            <div className="space-y-2">
              <Label>Imagen</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, imagen: e.target.files?.[0] ?? null })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
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
        title="Eliminar categoría"
        description={`¿Está seguro de eliminar la categoría "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

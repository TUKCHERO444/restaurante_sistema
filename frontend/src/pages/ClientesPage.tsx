import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { clientesService } from '../services/clientes.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputField, SelectField } from '../components/FormField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import type { Cliente } from '../types';

export function ClientesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    tipo_documento: 'DNI',
    numero_documento: '',
    correo: '',
    telefono: '',
    direccion: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Cliente>) => clientesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente creado exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear cliente');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Cliente> }) => clientesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente actualizado exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar cliente');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente eliminado exitosamente');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'No se puede eliminar: tiene pedidos asociados');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', tipo_documento: 'DNI', numero_documento: '', correo: '', telefono: '', direccion: '' });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (cliente: Cliente) => {
    setEditing(cliente);
    setForm({
      nombre: cliente.nombre,
      tipo_documento: cliente.tipo_documento,
      numero_documento: cliente.numero_documento ?? '',
      correo: cliente.correo ?? '',
      telefono: cliente.telefono ?? '',
      direccion: cliente.direccion ?? '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm({ nombre: '', tipo_documento: 'DNI', numero_documento: '', correo: '', telefono: '', direccion: '' });
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

  const clientes = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gestión de clientes del restaurante"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Clientes' }]}
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nuevo cliente</Button>}
      />

      <DataTable
        data={clientes}
        loading={isLoading}
        searchKeys={['nombre', 'numero_documento', 'correo']}
        emptyMessage="No hay clientes registrados"
        emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Crear cliente</Button>}
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          { key: 'nombre', header: 'Nombre', sortable: true },
          { key: 'tipo_documento', header: 'Tipo Doc.' },
          { key: 'numero_documento', header: 'Nro. Doc.' },
          { key: 'telefono', header: 'Teléfono' },
          { key: 'correo', header: 'Correo' },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-24 text-right',
            render: (cliente: Cliente) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(cliente)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(cliente)}>
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
            <DialogTitle>{editing ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              error={errors.nombre}
              required
              placeholder="Ej: Juan Pérez"
            />
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Tipo de documento"
                value={form.tipo_documento}
                onValueChange={(v) => setForm({ ...form, tipo_documento: v })}
                options={[
                  { value: 'DNI', label: 'DNI' },
                  { value: 'RUC', label: 'RUC' },
                  { value: 'CE', label: 'CE' },
                  { value: 'PASAPORTE', label: 'Pasaporte' },
                ]}
              />
              <InputField
                label="Nro. documento"
                value={form.numero_documento}
                onChange={(e) => setForm({ ...form, numero_documento: e.target.value })}
                placeholder="Ej: 12345678"
              />
            </div>
            <InputField
              label="Correo"
              type="email"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              placeholder="correo@ejemplo.com"
            />
            <InputField
              label="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Ej: 999888777"
            />
            <InputField
              label="Dirección"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Ej: Av. Principal 123"
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
        title="Eliminar cliente"
        description={`¿Está seguro de eliminar al cliente "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

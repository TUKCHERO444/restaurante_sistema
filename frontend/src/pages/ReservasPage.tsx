import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { reservasService } from '../services/reservas.service';
import { mesasService } from '../services/mesas.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputField, SelectField, TextareaField } from '../components/FormField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { StatusBadge } from '../components/StatusBadge';
import type { Reserva } from '../types';

export function ReservasPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Reserva | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reserva | null>(null);
  const [form, setForm] = useState({
    nombre_cliente: '',
    telefono: '',
    fecha_reserva: '',
    personas: 1,
    mesa_id: '',
    nota: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['reservas'],
    queryFn: () => reservasService.getAll(),
  });

  const { data: mesasData } = useQuery({
    queryKey: ['mesas'],
    queryFn: () => mesasService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Reserva>) => reservasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      toast.success('Reserva creada exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear reserva');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Reserva> }) => reservasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      toast.success('Reserva actualizada exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar reserva');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => reservasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      toast.success('Reserva eliminada exitosamente');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar reserva');
      setDeleteTarget(null);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => reservasService.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      toast.success('Reserva confirmada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al confirmar reserva');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => reservasService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      toast.success('Reserva cancelada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al cancelar reserva');
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre_cliente: '', telefono: '', fecha_reserva: '', personas: 1, mesa_id: '', nota: '' });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (reserva: Reserva) => {
    setEditing(reserva);
    setForm({
      nombre_cliente: reserva.nombre_cliente,
      telefono: reserva.telefono ?? '',
      fecha_reserva: reserva.fecha_reserva.slice(0, 16),
      personas: reserva.personas,
      mesa_id: reserva.mesa_id ? String(reserva.mesa_id) : '',
      nota: reserva.nota ?? '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm({ nombre_cliente: '', telefono: '', fecha_reserva: '', personas: 1, mesa_id: '', nota: '' });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.nombre_cliente.trim()) newErrors.nombre_cliente = 'El nombre es obligatorio';
    if (!form.fecha_reserva) newErrors.fecha_reserva = 'La fecha es obligatoria';
    if (form.personas < 1) newErrors.personas = 'Mínimo 1 persona';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const data = { ...form, mesa_id: form.mesa_id ? Number(form.mesa_id) : null };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const reservas = data?.data ?? [];
  const mesas = mesasData?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservas"
        description="Gestión de reservas del salón"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Reservas' }]}
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nueva reserva</Button>}
      />

      <DataTable
        data={reservas}
        loading={isLoading}
        searchKeys={['nombre_cliente', 'telefono']}
        emptyMessage="No hay reservas registradas"
        emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Crear reserva</Button>}
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          { key: 'nombre_cliente', header: 'Cliente', sortable: true },
          { key: 'telefono', header: 'Teléfono' },
          { key: 'fecha_reserva', header: 'Fecha', sortable: true },
          { key: 'personas', header: 'Personas' },
          {
            key: 'estado',
            header: 'Estado',
            render: (reserva: Reserva) => <StatusBadge status={reserva.estado} />,
          },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-32 text-right',
            render: (reserva: Reserva) => (
              <div className="flex justify-end gap-1">
                {reserva.estado === 'pendiente' && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => confirmMutation.mutate(reserva.id)}>
                      <Check className="h-4 w-4 text-success" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => cancelMutation.mutate(reserva.id)}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(reserva)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(reserva)}>
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
            <DialogTitle>{editing ? 'Editar reserva' : 'Nueva reserva'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Nombre del cliente"
              value={form.nombre_cliente}
              onChange={(e) => setForm({ ...form, nombre_cliente: e.target.value })}
              error={errors.nombre_cliente}
              required
            />
            <InputField
              label="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
            <InputField
              label="Fecha y hora"
              type="datetime-local"
              value={form.fecha_reserva}
              onChange={(e) => setForm({ ...form, fecha_reserva: e.target.value })}
              error={errors.fecha_reserva}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Personas"
                type="number"
                min={1}
                max={50}
                value={form.personas}
                onChange={(e) => setForm({ ...form, personas: Number(e.target.value) })}
                error={errors.personas}
                required
              />
              <SelectField
                label="Mesa"
                value={form.mesa_id}
                onValueChange={(v) => setForm({ ...form, mesa_id: v })}
                placeholder="Seleccionar mesa"
                options={mesas.map((m: any) => ({ value: String(m.id), label: m.nombre }))}
              />
            </div>
            <TextareaField
              label="Nota"
              value={form.nota}
              onChange={(e) => setForm({ ...form, nota: e.target.value })}
              rows={3}
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
        title="Eliminar reserva"
        description={`¿Está seguro de eliminar la reserva de "${deleteTarget?.nombre_cliente}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

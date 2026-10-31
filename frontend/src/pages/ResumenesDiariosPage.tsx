import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { resumenesService } from '../services/resumenes.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputField } from '../components/FormField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import type { ResumenDiario } from '../types';

export function ResumenesDiariosPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ResumenDiario | null>(null);
  const [form, setForm] = useState({ fecha_referencia: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['resumenes'],
    queryFn: () => resumenesService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<ResumenDiario>) => resumenesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumenes'] });
      toast.success('Resumen diario creado exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear resumen');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => resumenesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumenes'] });
      toast.success('Resumen diario eliminado exitosamente');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'No se puede eliminar: ya fue enviado');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setForm({ fecha_referencia: '' });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setForm({ fecha_referencia: '' });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.fecha_referencia) newErrors.fecha_referencia = 'La fecha es obligatoria';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    createMutation.mutate(form);
  };

  const resumenes = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resúmenes Diarios"
        description="Resúmenes diarios de boletas para SUNAT (RC)"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Resúmenes Diarios' }]}
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nuevo resumen</Button>}
      />

      <DataTable
        data={resumenes}
        loading={isLoading}
        searchKeys={['identificador']}
        emptyMessage="No hay resúmenes diarios registrados"
        emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Crear resumen</Button>}
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          { key: 'identificador', header: 'Identificador', sortable: true },
          { key: 'fecha_referencia', header: 'Fecha referencia' },
          { key: 'total_documentos', header: 'Documentos' },
          {
            key: 'monto_total',
            header: 'Monto total',
            className: 'text-right',
            render: (resumen: ResumenDiario) => <span className="font-mono">S/ {Number(resumen.monto_total).toFixed(2)}</span>,
          },
          {
            key: 'estado_sunat',
            header: 'Estado SUNAT',
            render: (resumen: ResumenDiario) => (
              <span className={resumen.estado_sunat === 'ACEPTADO' ? 'text-success' : resumen.estado_sunat === 'RECHAZADO' ? 'text-destructive' : 'text-warning'}>
                {resumen.estado_sunat}
              </span>
            ),
          },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-16 text-right',
            render: (resumen: ResumenDiario) => (
              <div className="flex justify-end gap-1">
                {resumen.estado_sunat === 'PENDIENTE' && (
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(resumen)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo resumen diario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Fecha de referencia"
              type="date"
              value={form.fecha_referencia}
              onChange={(e) => setForm({ ...form, fecha_referencia: e.target.value })}
              error={errors.fecha_referencia}
              required
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending}>Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar resumen diario"
        description={`¿Está seguro de eliminar el resumen ${deleteTarget?.identificador}? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

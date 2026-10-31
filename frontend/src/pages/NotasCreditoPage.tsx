import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { notasCreditoService } from '../services/notas-credito.service';
import { pedidosService } from '../services/pedidos.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { SelectField, TextareaField } from '../components/FormField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import type { NotaCredito } from '../types';

export function NotasCreditoPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NotaCredito | null>(null);
  const [form, setForm] = useState({ pedido_id: '', codigo_motivo: '', descripcion_motivo: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['notas-credito'],
    queryFn: () => notasCreditoService.getAll(),
  });

  const { data: pedidosData } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => pedidosService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<NotaCredito>) => notasCreditoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-credito'] });
      toast.success('Nota de crédito creada exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear nota de crédito');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notasCreditoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-credito'] });
      toast.success('Nota de crédito eliminada exitosamente');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'No se puede eliminar: ya fue enviada');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setForm({ pedido_id: '', codigo_motivo: '', descripcion_motivo: '' });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setForm({ pedido_id: '', codigo_motivo: '', descripcion_motivo: '' });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.pedido_id) newErrors.pedido_id = 'El pedido es obligatorio';
    if (!form.codigo_motivo) newErrors.codigo_motivo = 'El motivo es obligatorio';
    if (!form.descripcion_motivo.trim()) newErrors.descripcion_motivo = 'Descripción obligatoria';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    createMutation.mutate({ ...form, pedido_id: Number(form.pedido_id) });
  };

  const notasCredito = data?.data ?? [];
  const pedidos = pedidosData?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas de Crédito"
        description="Notas de crédito para anulación de comprobantes"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Notas de Crédito' }]}
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nueva nota</Button>}
      />

      <DataTable
        data={notasCredito}
        loading={isLoading}
        searchKeys={['serie', 'correlativo', 'descripcion_motivo']}
        emptyMessage="No hay notas de crédito registradas"
        emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Crear nota</Button>}
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          {
            key: 'serie',
            header: 'Serie',
            render: (nota: NotaCredito) => `${nota.serie}-${nota.correlativo}`,
          },
          { key: 'descripcion_motivo', header: 'Motivo' },
          {
            key: 'total',
            header: 'Total',
            className: 'text-right',
            render: (nota: NotaCredito) => <span className="font-mono">S/ {Number(nota.total).toFixed(2)}</span>,
          },
          {
            key: 'estado_sunat',
            header: 'Estado SUNAT',
            render: (nota: NotaCredito) => (
              <span className={nota.estado_sunat === 'ACEPTADO' ? 'text-success' : nota.estado_sunat === 'RECHAZADO' ? 'text-destructive' : 'text-warning'}>
                {nota.estado_sunat}
              </span>
            ),
          },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-16 text-right',
            render: (nota: NotaCredito) => (
              <div className="flex justify-end gap-1">
                {nota.estado_sunat === 'PENDIENTE' && (
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(nota)}>
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
            <DialogTitle>Nueva nota de crédito</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <SelectField
              label="Pedido"
              value={form.pedido_id}
              onValueChange={(v) => setForm({ ...form, pedido_id: v })}
              error={errors.pedido_id}
              required
              placeholder="Seleccionar pedido"
              options={pedidos.map((p: any) => ({ value: String(p.id), label: `Pedido #${p.id} - ${p.nombre_cliente}` }))}
            />
            <SelectField
              label="Motivo"
              value={form.codigo_motivo}
              onValueChange={(v) => setForm({ ...form, codigo_motivo: v })}
              error={errors.codigo_motivo}
              required
              options={[
                { value: '01', label: '01 - Anulación de la operación' },
                { value: '02', label: '02 - Anulación por error en la emisión' },
                { value: '03', label: '03 - Datos de emisión incorrectos' },
                { value: '06', label: '06 - Devolución total' },
                { value: '07', label: '07 - Devolución parcial' },
                { value: '13', label: '13 - Otros' },
              ]}
            />
            <TextareaField
              label="Descripción del motivo"
              value={form.descripcion_motivo}
              onChange={(e) => setForm({ ...form, descripcion_motivo: e.target.value })}
              error={errors.descripcion_motivo}
              required
              rows={3}
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
        title="Eliminar nota de crédito"
        description={`¿Está seguro de eliminar la nota de crédito ${deleteTarget?.serie}-${deleteTarget?.correlativo}? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { gastosService } from '../services/gastos.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputField } from '../components/FormField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import type { Gasto } from '../types';

export function GastosPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Gasto | null>(null);
  const [form, setForm] = useState({ concepto: '', monto: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['gastos'],
    queryFn: () => gastosService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Gasto>) => gastosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
      toast.success('Gasto registrado exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al registrar gasto');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => gastosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
      toast.success('Gasto eliminado exitosamente');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar gasto');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setForm({ concepto: '', monto: '' });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setForm({ concepto: '', monto: '' });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.concepto.trim()) newErrors.concepto = 'El concepto es obligatorio';
    if (!form.monto || Number(form.monto) <= 0) newErrors.monto = 'El monto debe ser mayor a 0';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    createMutation.mutate({ concepto: form.concepto, monto: Number(form.monto) });
  };

  const gastos = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos"
        description="Registro de gastos operativos"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Gastos' }]}
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nuevo gasto</Button>}
      />

      <DataTable
        data={gastos}
        loading={isLoading}
        searchKeys={['concepto']}
        emptyMessage="No hay gastos registrados"
        emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Registrar gasto</Button>}
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          { key: 'concepto', header: 'Concepto', sortable: true },
          {
            key: 'monto',
            header: 'Monto',
            className: 'text-right',
            render: (gasto: Gasto) => (
              <span className="font-mono">S/ {Number(gasto.monto).toFixed(2)}</span>
            ),
          },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-16 text-right',
            render: (gasto: Gasto) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(gasto)}>
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
            <DialogTitle>Nuevo gasto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Concepto"
              value={form.concepto}
              onChange={(e) => setForm({ ...form, concepto: e.target.value })}
              error={errors.concepto}
              required
              placeholder="Ej: Compra de insumos"
            />
            <InputField
              label="Monto"
              type="number"
              step="0.01"
              min="0"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              error={errors.monto}
              required
              placeholder="0.00"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar gasto"
        description={`¿Está seguro de eliminar el gasto "${deleteTarget?.concepto}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

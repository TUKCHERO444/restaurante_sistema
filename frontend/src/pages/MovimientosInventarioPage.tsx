import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { movimientosService } from '../services/movimientos.service';
import { productosService } from '../services/productos.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { InputField, SelectField, TextareaField } from '../components/FormField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import type { MovimientoInventario } from '../types';

export function MovimientosInventarioPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ producto_id: '', tipo: 'compra', cantidad: '', nota: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['movimientos'],
    queryFn: () => movimientosService.getAll(),
  });

  const { data: productosData } = useQuery({
    queryKey: ['productos'],
    queryFn: () => productosService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<MovimientoInventario>) => movimientosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Movimiento registrado exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al registrar movimiento');
    },
  });

  const openCreate = () => {
    setForm({ producto_id: '', tipo: 'compra', cantidad: '', nota: '' });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setForm({ producto_id: '', tipo: 'compra', cantidad: '', nota: '' });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.producto_id) newErrors.producto_id = 'El producto es obligatorio';
    if (!form.cantidad || Number(form.cantidad) < 1) newErrors.cantidad = 'Cantidad mínima 1';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    createMutation.mutate({
      producto_id: Number(form.producto_id),
      tipo: form.tipo as 'compra' | 'ajuste',
      cantidad: Number(form.cantidad),
      nota: form.nota || undefined,
    });
  };

  const movimientos = data?.data ?? [];
  const productos = productosData?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimientos de Inventario"
        description="Kardex de entradas y salidas de stock"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Inventario' }]}
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nuevo movimiento</Button>}
      />

      <DataTable
        data={movimientos}
        loading={isLoading}
        searchKeys={['nota']}
        emptyMessage="No hay movimientos registrados"
        emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Registrar movimiento</Button>}
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          {
            key: 'producto',
            header: 'Producto',
            render: (mov: MovimientoInventario) => mov.producto?.nombre ?? '-',
          },
          {
            key: 'tipo',
            header: 'Tipo',
            render: (mov: MovimientoInventario) => (
              <span className={mov.tipo === 'compra' ? 'text-success' : mov.tipo === 'venta' ? 'text-destructive' : 'text-info'}>
                {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
              </span>
            ),
          },
          {
            key: 'cantidad',
            header: 'Cantidad',
            className: 'text-right',
            render: (mov: MovimientoInventario) => (
              <span className="font-mono">{mov.cantidad > 0 ? '+' : ''}{mov.cantidad}</span>
            ),
          },
          {
            key: 'stock_nuevo',
            header: 'Stock resultante',
            className: 'text-right',
            render: (mov: MovimientoInventario) => (
              <span className="font-mono">{mov.stock_nuevo ?? '-'}</span>
            ),
          },
          { key: 'nota', header: 'Nota' },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo movimiento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <SelectField
              label="Producto"
              value={form.producto_id}
              onValueChange={(v) => setForm({ ...form, producto_id: v })}
              error={errors.producto_id}
              required
              placeholder="Seleccionar producto"
              options={productos.map((p: any) => ({ value: String(p.id), label: p.nombre }))}
            />
            <SelectField
              label="Tipo"
              value={form.tipo}
              onValueChange={(v) => setForm({ ...form, tipo: v })}
              options={[
                { value: 'compra', label: 'Compra (entrada)' },
                { value: 'ajuste', label: 'Ajuste (entrada)' },
              ]}
            />
            <InputField
              label="Cantidad"
              type="number"
              min={1}
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              error={errors.cantidad}
              required
            />
            <TextareaField
              label="Nota"
              value={form.nota}
              onChange={(e) => setForm({ ...form, nota: e.target.value })}
              rows={2}
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
    </div>
  );
}

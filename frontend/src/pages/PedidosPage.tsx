import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { pedidosService } from '../services/pedidos.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusBadge } from '../components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { InputField, SelectField } from '../components/FormField';
import type { Pedido } from '../types';

export function PedidosPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewPedido, setViewPedido] = useState<Pedido | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Pedido | null>(null);
  const [form, setForm] = useState({
    nombre_cliente: 'Público General',
    tipo_comprobante: 'ticket',
    metodo_pago: 'efectivo',
    notas: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => pedidosService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Pedido>) => pedidosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast.success('Pedido creado exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear pedido');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pedidosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast.success('Pedido eliminado exitosamente');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'No se puede eliminar: solo pedidos pendientes');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setForm({ nombre_cliente: 'Público General', tipo_comprobante: 'ticket', metodo_pago: 'efectivo', notas: '' });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setForm({ nombre_cliente: 'Público General', tipo_comprobante: 'ticket', metodo_pago: 'efectivo', notas: '' });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.nombre_cliente.trim()) newErrors.nombre_cliente = 'Nombre obligatorio';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    createMutation.mutate({ ...form, tipo_comprobante: form.tipo_comprobante as 'ticket' | 'boleta' | 'factura' });
  };

  const pedidos = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Gestión de pedidos del salón y delivery"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Pedidos' }]}
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nuevo pedido</Button>}
      />

      <DataTable
        data={pedidos}
        loading={isLoading}
        searchKeys={['nombre_cliente', 'serie', 'correlativo']}
        emptyMessage="No hay pedidos registrados"
        emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Crear pedido</Button>}
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          { key: 'nombre_cliente', header: 'Cliente', sortable: true },
          {
            key: 'tipo_comprobante',
            header: 'Comprobante',
            render: (pedido: Pedido) => (
              <span className="capitalize">{pedido.tipo_comprobante}</span>
            ),
          },
          {
            key: 'total',
            header: 'Total',
            className: 'text-right',
            render: (pedido: Pedido) => (
              <span className="font-mono">S/ {Number(pedido.total).toFixed(2)}</span>
            ),
          },
          {
            key: 'estado',
            header: 'Estado',
            render: (pedido: Pedido) => <StatusBadge status={pedido.estado} />,
          },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-24 text-right',
            render: (pedido: Pedido) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => setViewPedido(pedido)}>
                  <Eye className="h-4 w-4" />
                </Button>
                {pedido.estado === 'pendiente' && (
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(pedido)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Modal de creación */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo pedido</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Nombre del cliente"
              value={form.nombre_cliente}
              onChange={(e) => setForm({ ...form, nombre_cliente: e.target.value })}
              error={errors.nombre_cliente}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Tipo comprobante"
                value={form.tipo_comprobante}
                onValueChange={(v) => setForm({ ...form, tipo_comprobante: v })}
                options={[
                  { value: 'ticket', label: 'Ticket' },
                  { value: 'boleta', label: 'Boleta' },
                  { value: 'factura', label: 'Factura' },
                ]}
              />
              <SelectField
                label="Método de pago"
                value={form.metodo_pago}
                onValueChange={(v) => setForm({ ...form, metodo_pago: v })}
                options={[
                  { value: 'efectivo', label: 'Efectivo' },
                  { value: 'tarjeta', label: 'Tarjeta' },
                ]}
              />
            </div>
            <InputField
              label="Notas"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de detalle */}
      <Dialog open={!!viewPedido} onOpenChange={(open) => !open && setViewPedido(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pedido #{viewPedido?.id}</DialogTitle>
          </DialogHeader>
          {viewPedido && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Cliente:</span> {viewPedido.nombre_cliente}</div>
                <div><span className="font-medium">Estado:</span> <StatusBadge status={viewPedido.estado} /></div>
                <div><span className="font-medium">Comprobante:</span> {viewPedido.tipo_comprobante}</div>
                <div><span className="font-medium">Pago:</span> {viewPedido.metodo_pago}</div>
              </div>
              {viewPedido.detalles && viewPedido.detalles.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Detalle</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Producto</th>
                        <th className="text-right py-2">Cant.</th>
                        <th className="text-right py-2">Precio</th>
                        <th className="text-right py-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewPedido.detalles.map((det) => (
                        <tr key={det.id} className="border-b">
                          <td className="py-2">{det.producto?.nombre ?? '-'}</td>
                          <td className="text-right py-2">{det.cantidad}</td>
                          <td className="text-right py-2">S/ {Number(det.precio).toFixed(2)}</td>
                          <td className="text-right py-2">S/ {(det.cantidad * det.precio).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="text-right text-lg font-semibold">
                Total: S/ {Number(viewPedido.total).toFixed(2)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar pedido"
        description={`¿Está seguro de eliminar el pedido #${deleteTarget?.id}? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

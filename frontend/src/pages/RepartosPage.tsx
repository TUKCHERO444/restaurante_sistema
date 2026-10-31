import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { repartosService } from '../services/repartos.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusBadge } from '../components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import type { Reparto } from '../types';

export function RepartosPage() {
  const queryClient = useQueryClient();
  const [viewReparto, setViewReparto] = useState<Reparto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reparto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['repartos'],
    queryFn: () => repartosService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => repartosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repartos'] });
      toast.success('Reparto eliminado exitosamente');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'No se puede eliminar: reparto entregado');
      setDeleteTarget(null);
    },
  });

  const repartos = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repartos (Delivery)"
        description="Gestión de entregas a domicilio"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Repartos' }]}
      />

      <DataTable
        data={repartos}
        loading={isLoading}
        searchKeys={['nombre_cliente', 'direccion']}
        emptyMessage="No hay repartos registrados"
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          { key: 'nombre_cliente', header: 'Cliente', sortable: true },
          { key: 'telefono_cliente', header: 'Teléfono' },
          { key: 'direccion', header: 'Dirección' },
          {
            key: 'repartidor',
            header: 'Repartidor',
            render: (reparto: Reparto) => reparto.repartidor?.nombre ?? '-',
          },
          {
            key: 'estado',
            header: 'Estado',
            render: (reparto: Reparto) => <StatusBadge status={reparto.estado} />,
          },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-24 text-right',
            render: (reparto: Reparto) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => setViewReparto(reparto)}>
                  <Eye className="h-4 w-4" />
                </Button>
                {reparto.estado !== 'entregado' && (
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(reparto)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Modal detalle */}
      <Dialog open={!!viewReparto} onOpenChange={(open) => !open && setViewReparto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reparto #{viewReparto?.id}</DialogTitle>
          </DialogHeader>
          {viewReparto && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-medium">Cliente:</span> {viewReparto.nombre_cliente}</div>
                <div><span className="font-medium">Teléfono:</span> {viewReparto.telefono_cliente}</div>
                <div className="col-span-2"><span className="font-medium">Dirección:</span> {viewReparto.direccion}</div>
                <div><span className="font-medium">Repartidor:</span> {viewReparto.repartidor?.nombre ?? 'Sin asignar'}</div>
                <div><span className="font-medium">Estado:</span> <StatusBadge status={viewReparto.estado} /></div>
                <div><span className="font-medium">Método pago:</span> {viewReparto.metodo_pago}</div>
                <div><span className="font-medium">Costo envío:</span> S/ {Number(viewReparto.costo_envio).toFixed(2)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar reparto"
        description={`¿Está seguro de eliminar el reparto #${deleteTarget?.id}? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

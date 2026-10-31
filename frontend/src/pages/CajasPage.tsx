import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { cajasService } from '../services/cajas.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { InputField, TextareaField } from '../components/FormField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { StatusBadge } from '../components/StatusBadge';
import type { Caja } from '../types';

export function CajasPage() {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [viewCaja, setViewCaja] = useState<Caja | null>(null);
  const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
  const [form, setForm] = useState({ monto_apertura: '', notas: '' });
  const [closeForm, setCloseForm] = useState({ monto_cierre: '', notas: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['cajas'],
    queryFn: () => cajasService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { monto_apertura: number; notas?: string }) => cajasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
      toast.success('Caja abierta exitosamente');
      setOpenDialog(false);
      setForm({ monto_apertura: '', notas: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al abrir caja');
    },
  });

  const closeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { monto_cierre: number; notas?: string } }) =>
      cajasService.close(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
      toast.success('Caja cerrada exitosamente');
      setCloseDialogOpen(false);
      setSelectedCaja(null);
      setCloseForm({ monto_cierre: '', notas: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al cerrar caja');
    },
  });

  const handleOpen = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.monto_apertura || Number(form.monto_apertura) < 0) newErrors.monto_apertura = 'Monto obligatorio';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    createMutation.mutate({ monto_apertura: Number(form.monto_apertura), notas: form.notas || undefined });
  };

  const handleClose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaja) return;
    closeMutation.mutate({
      id: selectedCaja.id,
      data: { monto_cierre: Number(closeForm.monto_cierre), notas: closeForm.notas || undefined },
    });
  };

  const cajas = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cajas"
        description="Apertura y cierre de turnos de caja"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Cajas' }]}
        actions={<Button onClick={() => setOpenDialog(true)}><Plus className="mr-2 h-4 w-4" />Abrir caja</Button>}
      />

      <DataTable
        data={cajas}
        loading={isLoading}
        searchKeys={['usuario']}
        emptyMessage="No hay cajas registradas"
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          {
            key: 'usuario',
            header: 'Cajero',
            render: (caja: Caja) => caja.usuario?.nombre ?? '-',
          },
          {
            key: 'monto_apertura',
            header: 'Apertura',
            className: 'text-right',
            render: (caja: Caja) => <span className="font-mono">S/ {Number(caja.monto_apertura).toFixed(2)}</span>,
          },
          {
            key: 'monto_cierre',
            header: 'Cierre',
            className: 'text-right',
            render: (caja: Caja) => caja.monto_cierre ? <span className="font-mono">S/ {Number(caja.monto_cierre).toFixed(2)}</span> : '-',
          },
          {
            key: 'estado',
            header: 'Estado',
            render: (caja: Caja) => <StatusBadge status={caja.estado} />,
          },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-24 text-right',
            render: (caja: Caja) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => setViewCaja(caja)}>
                  <Eye className="h-4 w-4" />
                </Button>
                {caja.estado === 'abierta' && (
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedCaja(caja); setCloseDialogOpen(true); }}>
                    <Lock className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Modal apertura */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir caja</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleOpen} className="space-y-4">
            <InputField
              label="Monto de apertura"
              type="number"
              step="0.01"
              min="0"
              value={form.monto_apertura}
              onChange={(e) => setForm({ ...form, monto_apertura: e.target.value })}
              error={errors.monto_apertura}
              required
            />
            <TextareaField
              label="Notas"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              rows={2}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending}>Abrir</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal cierre */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar caja #{selectedCaja?.id}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleClose} className="space-y-4">
            <InputField
              label="Monto de cierre (conteo físico)"
              type="number"
              step="0.01"
              min="0"
              value={closeForm.monto_cierre}
              onChange={(e) => setCloseForm({ ...closeForm, monto_cierre: e.target.value })}
              required
            />
            <TextareaField
              label="Notas"
              value={closeForm.notas}
              onChange={(e) => setCloseForm({ ...closeForm, notas: e.target.value })}
              rows={2}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCloseDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={closeMutation.isPending}>Cerrar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal detalle */}
      <Dialog open={!!viewCaja} onOpenChange={(open) => !open && setViewCaja(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Caja #{viewCaja?.id}</DialogTitle>
          </DialogHeader>
          {viewCaja && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-medium">Cajero:</span> {viewCaja.usuario?.nombre}</div>
                <div><span className="font-medium">Estado:</span> <StatusBadge status={viewCaja.estado} /></div>
                <div><span className="font-medium">Apertura:</span> {new Date(viewCaja.apertura_en).toLocaleString()}</div>
                <div><span className="font-medium">Cierre:</span> {viewCaja.cierre_en ? new Date(viewCaja.cierre_en).toLocaleString() : '-'}</div>
                <div><span className="font-medium">Monto apertura:</span> S/ {Number(viewCaja.monto_apertura).toFixed(2)}</div>
                <div><span className="font-medium">Monto cierre:</span> {viewCaja.monto_cierre ? `S/ ${Number(viewCaja.monto_cierre).toFixed(2)}` : '-'}</div>
                <div><span className="font-medium">Monto esperado:</span> {viewCaja.monto_esperado ? `S/ ${Number(viewCaja.monto_esperado).toFixed(2)}` : '-'}</div>
                <div><span className="font-medium">Diferencia:</span> {viewCaja.diferencia ? `S/ ${Number(viewCaja.diferencia).toFixed(2)}` : '-'}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

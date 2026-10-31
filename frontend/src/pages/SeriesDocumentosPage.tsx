import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { seriesService } from '../services/series.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputField, SelectField } from '../components/FormField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import type { SerieDocumento } from '../types';

export function SeriesDocumentosPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SerieDocumento | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SerieDocumento | null>(null);
  const [form, setForm] = useState({
    codigo_documento: '',
    tipo_documento: '',
    serie: '',
    ultimo_numero: 0,
    activo: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['series'],
    queryFn: () => seriesService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<SerieDocumento>) => seriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      toast.success('Serie creada exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear serie');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SerieDocumento> }) => seriesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      toast.success('Serie actualizada exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar serie');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => seriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      toast.success('Serie eliminada exitosamente');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar serie');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ codigo_documento: '', tipo_documento: '', serie: '', ultimo_numero: 0, activo: true });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (serie: SerieDocumento) => {
    setEditing(serie);
    setForm({
      codigo_documento: serie.codigo_documento,
      tipo_documento: serie.tipo_documento,
      serie: serie.serie,
      ultimo_numero: serie.ultimo_numero,
      activo: serie.activo,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm({ codigo_documento: '', tipo_documento: '', serie: '', ultimo_numero: 0, activo: true });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.codigo_documento) newErrors.codigo_documento = 'Código obligatorio';
    if (!form.tipo_documento) newErrors.tipo_documento = 'Tipo obligatorio';
    if (!form.serie.trim()) newErrors.serie = 'La serie es obligatoria';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const series = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Series de Documentos"
        description="Talonarios para comprobantes electrónicos (SUNAT)"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Series' }]}
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nueva serie</Button>}
      />

      <DataTable
        data={series}
        loading={isLoading}
        searchKeys={['serie', 'tipo_documento']}
        emptyMessage="No hay series registradas"
        emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Crear serie</Button>}
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          { key: 'codigo_documento', header: 'Código' },
          { key: 'tipo_documento', header: 'Tipo' },
          { key: 'serie', header: 'Serie', sortable: true },
          { key: 'ultimo_numero', header: 'Último Nro.' },
          {
            key: 'activo',
            header: 'Estado',
            render: (serie: SerieDocumento) => (
              <span className={serie.activo ? 'text-success' : 'text-muted-foreground'}>
                {serie.activo ? 'Activo' : 'Inactivo'}
              </span>
            ),
          },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-24 text-right',
            render: (serie: SerieDocumento) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(serie)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(serie)}>
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
            <DialogTitle>{editing ? 'Editar serie' : 'Nueva serie'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Código documento"
                value={form.codigo_documento}
                onValueChange={(v) => setForm({ ...form, codigo_documento: v })}
                error={errors.codigo_documento}
                required
                options={[
                  { value: '01', label: '01 - Factura' },
                  { value: '03', label: '03 - Boleta' },
                  { value: '07', label: '07 - Nota de Crédito' },
                  { value: '08', label: '08 - Nota de Débito' },
                ]}
              />
              <SelectField
                label="Tipo documento"
                value={form.tipo_documento}
                onValueChange={(v) => setForm({ ...form, tipo_documento: v })}
                error={errors.tipo_documento}
                required
                options={[
                  { value: 'factura', label: 'Factura' },
                  { value: 'boleta', label: 'Boleta' },
                  { value: 'nota_credito_boleta', label: 'NC Boleta' },
                  { value: 'nota_credito_factura', label: 'NC Factura' },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Serie"
                value={form.serie}
                onChange={(e) => setForm({ ...form, serie: e.target.value.toUpperCase() })}
                error={errors.serie}
                required
                placeholder="Ej: B001"
                maxLength={4}
              />
              <InputField
                label="Último número"
                type="number"
                min={0}
                value={form.ultimo_numero}
                onChange={(e) => setForm({ ...form, ultimo_numero: Number(e.target.value) })}
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
        title="Eliminar serie"
        description={`¿Está seguro de eliminar la serie "${deleteTarget?.serie}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

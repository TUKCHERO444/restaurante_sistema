import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Power } from 'lucide-react';
import { toast } from 'sonner';
import { productosService } from '../services/productos.service';
import { categoriasService } from '../services/categorias.service';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputField, SelectField } from '../components/FormField';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import type { Producto } from '../types';

export function ProductosPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);
  const [form, setForm] = useState({
    categoria_id: '',
    nombre: '',
    codigo: '',
    codigo_barras: '',
    precio: '',
    precio_promocional: '',
    costo: '',
    stock: '',
    vendible: true,
    imagen: null as File | null,
    activo: true,
    recomendado_chef: false,
    nuevo: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: () => productosService.getAll(),
  });

  const { data: categoriasData } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => productosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto creado exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear producto');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => productosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto actualizado exitosamente');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar producto');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto eliminado exitosamente');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'No se puede eliminar: tiene pedidos asociados');
      setDeleteTarget(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => productosService.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Estado actualizado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar estado');
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      categoria_id: '', nombre: '', codigo: '', codigo_barras: '',
      precio: '', precio_promocional: '', costo: '', stock: '',
      vendible: true, imagen: null, activo: true, recomendado_chef: false, nuevo: false,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (producto: Producto) => {
    setEditing(producto);
    setForm({
      categoria_id: String(producto.categoria_id),
      nombre: producto.nombre,
      codigo: producto.codigo ?? '',
      codigo_barras: producto.codigo_barras ?? '',
      precio: String(producto.precio),
      precio_promocional: producto.precio_promocional ? String(producto.precio_promocional) : '',
      costo: producto.costo ? String(producto.costo) : '',
      stock: producto.stock !== null ? String(producto.stock) : '',
      vendible: producto.vendible,
      imagen: null,
      activo: producto.activo,
      recomendado_chef: producto.recomendado_chef,
      nuevo: producto.nuevo,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm({
      categoria_id: '', nombre: '', codigo: '', codigo_barras: '',
      precio: '', precio_promocional: '', costo: '', stock: '',
      vendible: true, imagen: null, activo: true, recomendado_chef: false, nuevo: false,
    });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.categoria_id) newErrors.categoria_id = 'La categoría es obligatoria';
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.precio || Number(form.precio) <= 0) newErrors.precio = 'Precio obligatorio';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const formData = new FormData();
    formData.append('categoria_id', form.categoria_id);
    formData.append('nombre', form.nombre);
    formData.append('codigo', form.codigo);
    formData.append('codigo_barras', form.codigo_barras);
    formData.append('precio', form.precio);
    formData.append('precio_promocional', form.precio_promocional || '');
    formData.append('costo', form.costo || '');
    formData.append('stock', form.stock || '');
    formData.append('vendible', String(form.vendible));
    formData.append('activo', String(form.activo));
    formData.append('recomendado_chef', String(form.recomendado_chef));
    formData.append('nuevo', String(form.nuevo));
    if (form.imagen) formData.append('imagen', form.imagen);

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const productos = data?.data ?? [];
  const categorias = categoriasData?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Catálogo de productos e insumos"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Productos' }]}
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nuevo producto</Button>}
      />

      <DataTable
        data={productos}
        loading={isLoading}
        searchKeys={['nombre', 'codigo', 'codigo_barras']}
        emptyMessage="No hay productos registrados"
        emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Crear producto</Button>}
        columns={[
          { key: 'id', header: 'ID', className: 'w-16' },
          { key: 'nombre', header: 'Nombre', sortable: true },
          { key: 'codigo_barras', header: 'Código barras' },
          {
            key: 'precio',
            header: 'Precio',
            className: 'text-right',
            render: (prod: Producto) => (
              <span className="font-mono">S/ {Number(prod.precio).toFixed(2)}</span>
            ),
          },
          {
            key: 'stock',
            header: 'Stock',
            className: 'text-right',
            render: (prod: Producto) => (
              <span className={prod.stock !== null && prod.stock <= 5 ? 'text-destructive font-semibold' : ''}>
                {prod.stock ?? 'Ilimitado'}
              </span>
            ),
          },
          {
            key: 'activo',
            header: 'Estado',
            render: (prod: Producto) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleMutation.mutate(prod.id)}
                >
                  <Power className={`h-4 w-4 ${prod.activo ? 'text-success' : 'text-muted-foreground'}`} />
                </Button>
                {prod.recomendado_chef && <Badge variant="info">Chef</Badge>}
                {prod.nuevo && <Badge variant="secondary">Nuevo</Badge>}
              </div>
            ),
          },
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'w-24 text-right',
            render: (prod: Producto) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(prod)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(prod)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Categoría"
                value={form.categoria_id}
                onValueChange={(v) => setForm({ ...form, categoria_id: v })}
                error={errors.categoria_id}
                required
                options={categorias.map((c: any) => ({ value: String(c.id), label: c.nombre }))}
              />
              <InputField
                label="Nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                error={errors.nombre}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
              <InputField label="Código de barras" value={form.codigo_barras} onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Precio" type="number" step="0.01" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} error={errors.precio} required />
              <InputField label="Precio promocional" type="number" step="0.01" min="0" value={form.precio_promocional} onChange={(e) => setForm({ ...form, precio_promocional: e.target.value })} />
              <InputField label="Costo" type="number" step="0.01" min="0" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Stock (vacío = ilimitado)" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              <div className="space-y-2">
                <Label>Imagen</Label>
                <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imagen: e.target.files?.[0] ?? null })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.vendible} onCheckedChange={(v: boolean) => setForm({ ...form, vendible: v })} />
                <Label>Vendible</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.activo} onCheckedChange={(v: boolean) => setForm({ ...form, activo: v })} />
                <Label>Activo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.recomendado_chef} onCheckedChange={(v: boolean) => setForm({ ...form, recomendado_chef: v })} />
                <Label>Recomendado chef</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.nuevo} onCheckedChange={(v: boolean) => setForm({ ...form, nuevo: v })} />
                <Label>Nuevo</Label>
              </div>
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
        title="Eliminar producto"
        description={`¿Está seguro de eliminar el producto "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

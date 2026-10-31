import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { posService } from '../services/pos.service';
import { CategoriaList } from '../components/pos/CategoriaList';
import { ProductoCard } from '../components/pos/ProductoCard';
import { CarritoPanel } from '../components/pos/CarritoPanel';
import { CobroDialog } from '../components/pos/CobroDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { Producto, CarritoLinea, CobroRequest } from '@/types';

/**
 * Vista 2 del POS — Toma de pedido.
 * Tres columnas: categorías | productos | carrito.
 */
export function PosPedidoPage() {
  const { mesaId } = useParams<{ mesaId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [cobroAbierto, setCobroAbierto] = useState(false);
  const [notaDetalleId, setNotaDetalleId] = useState<number | null>(null);
  const [notaTexto, setNotaTexto] = useState('');
  const [moverMesaAbierto, setMoverMesaAbierto] = useState(false);
  const [nuevaMesaId, setNuevaMesaId] = useState<string>('');
  const [opcionesAbierto, setOpcionesAbierto] = useState(false);
  const [descuento, setDescuento] = useState('0');
  const [propina, setPropina] = useState('0');

  const id = Number(mesaId);

  // Queries
  const { data: pedidoData, isLoading: pedidoLoading } = useQuery({
    queryKey: ['pos-pedido', id],
    queryFn: () => posService.obtenerPedido(id),
    enabled: !!id,
  });

  const { data: categoriasData, isLoading: categoriasLoading } = useQuery({
    queryKey: ['pos-categorias'],
    queryFn: () => posService.categoriasConProductos(),
  });

  const categorias = categoriasData ?? [];
  const pedido = pedidoData?.pedido ?? null;
  const detalles = pedidoData?.detalles ?? [];
  const mesasLibres = pedidoData?.mesasLibres ?? [];
  const mesa = pedidoData?.mesa;

  // Filtrar productos
  const productosFiltrados = categorias
    .flatMap((cat) => cat.productos)
    .filter((p: Producto) => {
      if (categoriaSeleccionada !== null) {
        const cat = categorias.find((c) => c.id === categoriaSeleccionada);
        if (!cat?.productos.some((prod: Producto) => prod.id === p.id)) return false;
      }
      if (busqueda) {
        const q = busqueda.toLowerCase();
        return (
          p.nombre.toLowerCase().includes(q) ||
          p.codigo?.toLowerCase().includes(q) ||
          p.codigo_barras?.toLowerCase().includes(q)
        );
      }
      return true;
    });

  // Mutations
  const agregarMutation = useMutation({
    mutationFn: (productoId: number) =>
      posService.agregarProducto(pedido?.id ?? null, id, productoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-pedido', id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al agregar producto');
    },
  });

  const cantidadMutation = useMutation({
    mutationFn: ({ detalleId, cantidad }: { detalleId: number; cantidad: number }) =>
      posService.actualizarCantidad(detalleId, cantidad),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-pedido', id] });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (detalleId: number) => posService.eliminarLinea(detalleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-pedido', id] });
      toast.success('Línea eliminada');
    },
  });

  const notaMutation = useMutation({
    mutationFn: ({ detalleId, nota }: { detalleId: number; nota: string }) =>
      posService.guardarNota(detalleId, nota),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-pedido', id] });
      toast.success('Nota guardada');
      setNotaDetalleId(null);
      setNotaTexto('');
    },
  });

  const opcionesMutation = useMutation({
    mutationFn: () =>
      posService.aplicarOpciones(pedido!.id, parseFloat(descuento) || 0, parseFloat(propina) || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-pedido', id] });
      toast.success('Opciones aplicadas');
      setOpcionesAbierto(false);
    },
  });

  const moverMesaMutation = useMutation({
    mutationFn: () => posService.moverMesa(pedido!.id, Number(nuevaMesaId)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pos-pedido', id] });
      toast.success('Pedido movido exitosamente');
      setMoverMesaAbierto(false);
      navigate(`/admin/pos/mesa/${data.mesa_id}`);
    },
    onError: () => {
      toast.error('No se puede mover: la mesa destino está ocupada');
    },
  });

  const cobrarMutation = useMutation({
    mutationFn: (datos: CobroRequest) => posService.cobrar(pedido!.id, datos),
    onSuccess: (data) => {
      toast.success(data.mensaje || 'Cobro exitoso');
      navigate('/admin/pos');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al procesar el cobro');
    },
  });

  // Construir líneas del carrito
  const lineas: CarritoLinea[] = detalles.map((detalle) => ({
    detalle,
    producto: {
      id: detalle.producto_id,
      nombre: detalle.producto?.nombre ?? 'Producto',
      precio: detalle.precio,
      stock: null,
    } as Producto,
    subtotal: detalle.precio * detalle.cantidad,
  }));

  const subtotal = lineas.reduce((acc, l) => acc + l.subtotal, 0);
  const total = Math.max(0, subtotal - (pedido?.descuento ?? 0) + (pedido?.propina ?? 0));

  if (pedidoLoading || categoriasLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Topbar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/pos')}
            aria-label="Volver al mapa de mesas"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Button>
          <div>
            <h2 className="font-heading text-lg font-semibold text-card-foreground">
              Mesa: {mesa?.nombre ?? id}
            </h2>
            <p className="text-xs text-muted-foreground">
              Área: {mesa?.area?.nombre ?? '—'}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setMoverMesaAbierto(true)}
          disabled={!pedido}
        >
          <ArrowRightLeft className="mr-2 size-4" aria-hidden />
          Mover mesa
        </Button>
      </div>

      {/* Cuerpo: 3 columnas */}
      <div className="grid flex-1 grid-cols-[180px_1fr_280px] overflow-hidden">
        {/* Columna izquierda: categorías */}
        <div className="border-r border-border bg-card">
          <CategoriaList
            categorias={categorias.map((c) => ({ id: c.id, nombre: c.nombre }))}
            seleccionada={categoriaSeleccionada}
            onSeleccionar={setCategoriaSeleccionada}
          />
        </div>

        {/* Columna central: productos */}
        <div className="flex flex-col overflow-hidden bg-background">
          {/* Buscador */}
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o código..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Grid productos */}
          <div className="flex-1 overflow-y-auto p-3">
            {productosFiltrados.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No se encontraron productos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
                {productosFiltrados.map((producto: Producto) => (
                  <ProductoCard
                    key={producto.id}
                    producto={producto}
                    onAgregar={(p) => agregarMutation.mutate(p.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: carrito */}
        <div className="border-l border-border bg-card">
          <CarritoPanel
            lineas={lineas}
            descuento={pedido?.descuento ?? 0}
            propina={pedido?.propina ?? 0}
            onCambiarCantidad={(detalleId, cantidad) => {
              if (cantidad < 1) {
                eliminarMutation.mutate(detalleId);
              } else {
                cantidadMutation.mutate({ detalleId, cantidad });
              }
            }}
            onEliminarLinea={(detalleId) => eliminarMutation.mutate(detalleId)}
            onNota={(detalleId) => {
              setNotaDetalleId(detalleId);
              const detalle = detalles.find((d) => d.id === detalleId);
              setNotaTexto(detalle?.nota ?? '');
            }}
            onOpciones={() => setOpcionesAbierto(true)}
            onCobrar={() => setCobroAbierto(true)}
            cargando={cobrarMutation.isPending}
          />
        </div>
      </div>

      {/* Dialog nota */}
      <Dialog open={notaDetalleId !== null} onOpenChange={() => setNotaDetalleId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nota de cocina</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nota">Instrucciones especiales</Label>
            <Input
              id="nota"
              value={notaTexto}
              onChange={(e) => setNotaTexto(e.target.value)}
              placeholder="Ej: Sin cebolla, bien cocido..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotaDetalleId(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => notaMutation.mutate({ detalleId: notaDetalleId!, nota: notaTexto })}
              disabled={notaMutation.isPending}
            >
              Guardar nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog opciones */}
      <Dialog open={opcionesAbierto} onOpenChange={setOpcionesAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Opciones del pedido</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="descuento">Descuento (S/)</Label>
              <Input
                id="descuento"
                type="number"
                min={0}
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="propina">Propina (S/)</Label>
              <Input
                id="propina"
                type="number"
                min={0}
                value={propina}
                onChange={(e) => setPropina(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpcionesAbierto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => opcionesMutation.mutate()}
              disabled={opcionesMutation.isPending}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog mover mesa */}
      <Dialog open={moverMesaAbierto} onOpenChange={setMoverMesaAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover a otra mesa</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label>Selecciona una mesa libre</Label>
            <select
              value={nuevaMesaId}
              onChange={(e) => setNuevaMesaId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Seleccionar...</option>
              {mesasLibres.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} — {m.area?.nombre}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoverMesaAbierto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => moverMesaMutation.mutate()}
              disabled={!nuevaMesaId || moverMesaMutation.isPending}
            >
              Mover pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog cobro */}
      <CobroDialog
        open={cobroAbierto}
        onOpenChange={setCobroAbierto}
        total={total}
        onConfirmar={(datos) => cobrarMutation.mutate(datos)}
        cargando={cobrarMutation.isPending}
      />
    </div>
  );
}

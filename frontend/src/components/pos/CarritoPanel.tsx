import { Minus, Plus, Trash2, StickyNote, Settings, ArrowRightLeft, Receipt } from 'lucide-react';
import type { CarritoLinea } from '@/types';
import { Button } from '@/components/ui/button';

interface CarritoPanelProps {
  lineas: CarritoLinea[];
  descuento: number;
  propina: number;
  onCambiarCantidad: (detalleId: number, cantidad: number) => void;
  onEliminarLinea: (detalleId: number) => void;
  onNota: (detalleId: number) => void;
  onOpciones: () => void;
  onCobrar: () => void;
  cargando: boolean;
}

/**
 * Panel lateral derecho del POS con las líneas del carrito,
 * totales y acciones de cobro.
 */
export function CarritoPanel({
  lineas,
  descuento,
  propina,
  onCambiarCantidad,
  onEliminarLinea,
  onNota,
  onOpciones,
  onCobrar,
  cargando,
}: CarritoPanelProps) {
  const subtotal = lineas.reduce((acc, l) => acc + l.subtotal, 0);
  const total = Math.max(0, subtotal - descuento + propina);

  return (
    <div className="flex h-full flex-col">
      {/* Encabezado */}
      <div className="border-b border-border p-3">
        <h3 className="font-heading text-sm font-semibold text-card-foreground">
          Cuenta actual
        </h3>
        <p className="text-xs text-muted-foreground">
          {lineas.length} {lineas.length === 1 ? 'producto' : 'productos'}
        </p>
      </div>

      {/* Líneas */}
      <div className="flex-1 overflow-y-auto">
        {lineas.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-center text-sm text-muted-foreground">
              Agrega productos para comenzar
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {lineas.map((linea) => (
              <li
                key={linea.detalle.id}
                className="flex items-center gap-2 border-b border-border px-3 py-2"
              >
                {/* Info producto */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-card-foreground">
                    {linea.producto.nombre}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    S/ {linea.detalle.precio.toFixed(2)} c/u
                  </p>
                </div>

                {/* Stepper cantidad */}
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => onCambiarCantidad(linea.detalle.id, linea.detalle.cantidad - 1)}
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="size-3" aria-hidden />
                  </Button>
                  <span className="w-6 text-center text-xs font-semibold">
                    {linea.detalle.cantidad}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => onCambiarCantidad(linea.detalle.id, linea.detalle.cantidad + 1)}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="size-3" aria-hidden />
                  </Button>
                </div>

                {/* Subtotal */}
                <span className="w-16 text-right text-xs font-semibold text-card-foreground">
                  S/ {linea.subtotal.toFixed(2)}
                </span>

                {/* Acciones */}
                <div className="flex gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => onNota(linea.detalle.id)}
                    aria-label="Agregar nota"
                    title="Nota de cocina"
                  >
                    <StickyNote className="size-3" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:text-destructive"
                    onClick={() => onEliminarLinea(linea.detalle.id)}
                    aria-label="Eliminar línea"
                  >
                    <Trash2 className="size-3" aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Totales */}
      <div className="border-t border-border p-3">
        <dl className="flex flex-col gap-1 text-xs">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium text-card-foreground">S/ {subtotal.toFixed(2)}</dd>
          </div>
          {descuento > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Descuento</dt>
              <dd className="font-medium text-destructive">- S/ {descuento.toFixed(2)}</dd>
            </div>
          )}
          {propina > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Propina</dt>
              <dd className="font-medium text-success">+ S/ {propina.toFixed(2)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-1 text-sm font-semibold">
            <dt className="text-card-foreground">Total</dt>
            <dd className="text-primary">S/ {total.toFixed(2)}</dd>
          </div>
        </dl>
      </div>

      {/* Acciones */}
      <div className="flex flex-col gap-2 border-t border-border p-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpciones}
            disabled={lineas.length === 0}
          >
            <Settings className="mr-1 size-3" aria-hidden />
            Opciones
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
          >
            <ArrowRightLeft className="mr-1 size-3" aria-hidden />
            Dividir
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={onCobrar}
          disabled={lineas.length === 0 || cargando}
          className="w-full"
        >
          <Receipt className="mr-2 size-4" aria-hidden />
          {cargando ? 'Procesando...' : 'Cobrar'}
        </Button>
      </div>
    </div>
  );
}

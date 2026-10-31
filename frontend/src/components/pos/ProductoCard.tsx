import { Package } from 'lucide-react';
import type { Producto } from '@/types';
import { cn } from '@/lib/utils';

interface ProductoCardProps {
  producto: Producto;
  onAgregar: (producto: Producto) => void;
}

/**
 * Tarjeta de producto en el grid del POS.
 * Muestra imagen o icono, precio, stock y nombre.
 */
export function ProductoCard({ producto, onAgregar }: ProductoCardProps) {
  const stockBajo = producto.stock !== null && producto.stock <= 5;

  return (
    <button
      type="button"
      onClick={() => onAgregar(producto)}
      aria-label={`Agregar ${producto.nombre} al pedido`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-shadow',
        'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      {/* Imagen o icono */}
      <div className="relative flex h-24 items-center justify-center bg-muted">
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <Package className="size-8 text-muted-foreground" aria-hidden />
        )}

        {/* Badge precio */}
        <span className="absolute right-2 top-2 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
          S/ {producto.precio.toFixed(2)}
        </span>

        {/* Badge stock */}
        {producto.stock !== null && (
          <span
            className={cn(
              'absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-medium',
              stockBajo
                ? 'animate-pulse bg-destructive text-destructive-foreground'
                : 'bg-secondary text-secondary-foreground',
            )}
          >
            Stock: {producto.stock}
          </span>
        )}

        {/* Overlay hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
          <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            Agregar
          </span>
        </div>
      </div>

      {/* Nombre */}
      <div className="p-2">
        <p className="truncate text-xs font-medium text-card-foreground">
          {producto.nombre}
        </p>
        {producto.categoria && (
          <p className="truncate text-[10px] text-muted-foreground">
            {producto.categoria.nombre}
          </p>
        )}
      </div>
    </button>
  );
}

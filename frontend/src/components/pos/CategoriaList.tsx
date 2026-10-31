import { cn } from '@/lib/utils';

interface Categoria {
  id: number;
  nombre: string;
}

interface CategoriaListProps {
  categorias: Categoria[];
  seleccionada: number | null;
  onSeleccionar: (id: number | null) => void;
}

/**
 * Lista de categorías en columna izquierda del POS.
 * Permite filtrar productos por categoría o ver todos.
 */
export function CategoriaList({ categorias, seleccionada, onSeleccionar }: CategoriaListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <h3 className="font-heading text-sm font-semibold text-card-foreground">
          Categorías
        </h3>
      </div>
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Categorías">
        <ul className="flex flex-col gap-1">
          <li>
            <button
              type="button"
              onClick={() => onSeleccionar(null)}
              className={cn(
                'w-full rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                seleccionada === null
                  ? 'bg-primary text-primary-foreground'
                  : 'text-card-foreground hover:bg-accent',
              )}
            >
              Todo
            </button>
          </li>
          {categorias.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(cat.id)}
                className={cn(
                  'w-full rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  seleccionada === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-card-foreground hover:bg-accent',
                )}
              >
                {cat.nombre}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

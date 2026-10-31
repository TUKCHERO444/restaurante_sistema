import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/** Página 404 para rutas desconocidas dentro de la SPA. */
export function NotFoundPage() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h2 className="text-2xl font-bold tracking-tight">
        Página no encontrada
      </h2>
      <p className="text-muted-foreground">
        La ruta que buscas no existe.
      </p>
      <Button type="button" asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </section>
  );
}

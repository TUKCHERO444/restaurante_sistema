import { HealthStatus } from '@/components/HealthStatus';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const TECNOLOGIAS = [
  'React 19',
  'TypeScript',
  'Vite 8',
  'Tailwind CSS v4',
  'shadcn/ui',
  'Lucide',
  'React Router',
  'TanStack Query',
  'Axios',
  'Laravel 12 API',
];

/**
 * Página inicial de demostración visual.
 * Verifica estilos, componentes, iconos y conexión con la API.
 * No es un módulo del restaurante.
 */
export function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Base visual del sistema
        </h2>
        <p className="text-muted-foreground">
          Demostración de la configuración de estilos y componentes. Los
          módulos del restaurante se construirán sobre esta base.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <HealthStatus />

        <Card>
          <CardHeader>
            <CardTitle>Pila tecnológica</CardTitle>
            <CardDescription>
              Frontend y backend desacoplados por HTTP/JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-2" aria-label="Tecnologías">
              {TECNOLOGIAS.map((tec) => (
                <li key={tec}>
                  <Badge variant="secondary">{tec}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Componentes base</CardTitle>
          <CardDescription>
            Variantes de botón y estados visuales disponibles
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Button type="button">Primario</Button>
          <Button type="button" variant="secondary">
            Secundario
          </Button>
          <Button type="button" variant="outline">
            Contorno
          </Button>
          <Button type="button" variant="ghost">
            Fantasma
          </Button>
          <Button type="button" variant="destructive">
            Peligro
          </Button>
          <Button type="button" disabled>
            Deshabilitado
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

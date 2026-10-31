import { RefreshCw, Server, Wifi, WifiOff } from 'lucide-react';
import { useHealth } from '@/hooks/useHealth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Estado de la conexión con la API de Laravel.
 * Demuestra el flujo servicio HTTP + TanStack Query + componentes ui.
 */
export function HealthStatus() {
  const { data, isLoading, isError, error, refetch, isFetching } = useHealth();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="size-5" aria-hidden />
            API del restaurante
          </CardTitle>
          {isLoading ? (
            <Badge variant="secondary">Conectando…</Badge>
          ) : isError || !data ? (
            <Badge variant="destructive">
              <WifiOff /> Sin conexión
            </Badge>
          ) : (
            <Badge variant="success">
              <Wifi /> En línea
            </Badge>
          )}
        </div>
        <CardDescription>
          GET <code className="font-mono text-xs">/health</code> vía Axios +
          TanStack Query
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Verificando que el backend responde…
          </p>
        ) : isError || !data ? (
          <p className="text-sm text-destructive">
            {error?.message ?? 'Error desconocido.'} Verifica que Laravel esté
            en ejecución en el puerto 8000.
          </p>
        ) : (
          <dl className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Servicio</dt>
              <dd className="font-medium">{data.service}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Estado</dt>
              <dd className="font-mono font-medium">{data.status}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Hora API</dt>
              <dd className="font-medium">
                {new Date(data.timestamp).toLocaleTimeString('es-PE')}
              </dd>
            </div>
          </dl>
        )}
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={isFetching ? 'animate-spin' : undefined} />
          {isFetching ? 'Verificando…' : 'Verificar de nuevo'}
        </Button>
      </CardFooter>
    </Card>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingCart, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { healthService } from '@/services/health.service';
import { useAuth } from '@/hooks/useAuth';

/**
 * Página principal del panel de administración.
 * Muestra resumen de métricas y estado del sistema.
 */
export function DashboardPage() {
  const { usuario } = useAuth();
  const { isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: healthService.check,
  });

  const stats = [
    { label: 'Usuarios activos', value: '—', icon: Users, color: 'text-info' },
    { label: 'Pedidos hoy', value: '—', icon: ShoppingCart, color: 'text-success' },
    { label: 'Reservas', value: '—', icon: Calendar, color: 'text-warning' },
    { label: 'Ingresos', value: '—', icon: DollarSign, color: 'text-primary' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">
          Bienvenido, {usuario?.nombre}
        </h2>
        <p className="text-muted-foreground">
          Resumen general del sistema de gestión
        </p>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`size-4 ${stat.color}`} aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado del sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del sistema</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">API Backend</span>
            {isLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <Badge variant="success">En línea</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Versión</span>
            <span className="text-sm font-medium">v1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rol</span>
            <Badge variant="secondary">{usuario?.rol}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

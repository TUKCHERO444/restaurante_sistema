import { Badge } from './ui/badge';

type StatusType = 'success' | 'warning' | 'destructive' | 'info' | 'default' | 'secondary';

const statusMap: Record<string, { variant: StatusType; label: string }> = {
  // Estados generales
  activo: { variant: 'success', label: 'Activo' },
  inactivo: { variant: 'secondary', label: 'Inactivo' },
  libre: { variant: 'success', label: 'Libre' },
  ocupada: { variant: 'destructive', label: 'Ocupada' },
  reservada: { variant: 'warning', label: 'Reservada' },
  pendiente: { variant: 'warning', label: 'Pendiente' },
  completada: { variant: 'success', label: 'Completada' },
  anulada: { variant: 'destructive', label: 'Anulada' },
  cancelada: { variant: 'destructive', label: 'Cancelada' },
  cancelado: { variant: 'destructive', label: 'Cancelado' },
  confirmada: { variant: 'success', label: 'Confirmada' },
  abierta: { variant: 'success', label: 'Abierta' },
  cerrada: { variant: 'secondary', label: 'Cerrada' },
  en_cocina: { variant: 'warning', label: 'En cocina' },
  servido: { variant: 'success', label: 'Servido' },
  en_preparacion: { variant: 'warning', label: 'En preparación' },
  en_camino: { variant: 'info', label: 'En camino' },
  entregado: { variant: 'success', label: 'Entregado' },
  vendible: { variant: 'success', label: 'Vendible' },
  insumo: { variant: 'secondary', label: 'Insumo' },
  recomendado: { variant: 'info', label: 'Recomendado' },
  nuevo: { variant: 'info', label: 'Nuevo' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusMap[status] ?? { variant: 'default' as StatusType, label: status };
  return <Badge variant={config.variant} className={className}>{config.label}</Badge>;
}

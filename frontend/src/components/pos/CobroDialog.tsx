import { useState } from 'react';
import { User, CreditCard, Banknote } from 'lucide-react';
import type { CobroRequest } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CobroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onConfirmar: (datos: CobroRequest) => void;
  cargando: boolean;
}

/**
 * Diálogo de cobro del POS.
 * Permite seleccionar cliente, tipo de comprobante, método de pago y monto recibido.
 */
export function CobroDialog({ open, onOpenChange, total, onConfirmar, cargando }: CobroDialogProps) {
  const [cliente, setCliente] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState<'ticket' | 'boleta' | 'factura'>('ticket');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta'>('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');

  const monto = parseFloat(montoRecibido) || 0;
  const vuelto = Math.max(0, monto - total);
  const puedeCobrar = metodoPago === 'tarjeta' || monto >= total;

  const handleConfirmar = () => {
    onConfirmar({
      cliente_id: null,
      nombre_cliente: cliente,
      documento_cliente: null,
      tipo_comprobante: tipoComprobante,
      metodo_pago: metodoPago,
      monto_recibido: metodoPago === 'efectivo' ? monto : total,
    });
    setCliente('');
    setMontoRecibido('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cobrar cuenta</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Total */}
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-xs text-muted-foreground">Total a cobrar</p>
            <p className="text-2xl font-bold text-primary">S/ {total.toFixed(2)}</p>
          </div>

          {/* Cliente */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="cliente" className="flex items-center gap-2">
              <User className="size-4" aria-hidden />
              Cliente (opcional)
            </Label>
            <Input
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nombre del cliente"
            />
          </div>

          {/* Tipo comprobante */}
          <div className="flex flex-col gap-2">
            <Label>Tipo de comprobante</Label>
            <Select value={tipoComprobante} onValueChange={(v) => setTipoComprobante(v as 'ticket' | 'boleta' | 'factura')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ticket">Ticket</SelectItem>
                <SelectItem value="boleta">Boleta</SelectItem>
                <SelectItem value="factura">Factura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Método pago */}
          <div className="flex flex-col gap-2">
            <Label>Método de pago</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={metodoPago === 'efectivo' ? 'default' : 'outline'}
                onClick={() => setMetodoPago('efectivo')}
                className="justify-start"
              >
                <Banknote className="mr-2 size-4" aria-hidden />
                Efectivo
              </Button>
              <Button
                type="button"
                variant={metodoPago === 'tarjeta' ? 'default' : 'outline'}
                onClick={() => setMetodoPago('tarjeta')}
                className="justify-start"
              >
                <CreditCard className="mr-2 size-4" aria-hidden />
                Tarjeta
              </Button>
            </div>
          </div>

          {/* Monto recibido (solo efectivo) */}
          {metodoPago === 'efectivo' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="monto-recibido">Monto recibido</Label>
              <Input
                id="monto-recibido"
                type="number"
                min={0}
                step="0.01"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
                placeholder="0.00"
              />
              {monto > 0 && (
                <p className="text-sm text-muted-foreground">
                  Cambio:{' '}
                  <span className={cn('font-semibold', vuelto > 0 ? 'text-success' : 'text-muted-foreground')}>
                    S/ {vuelto.toFixed(2)}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={cargando}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirmar} disabled={!puedeCobrar || cargando}>
            {cargando ? 'Procesando...' : 'Confirmar cobro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

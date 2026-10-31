<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Caja;
use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\Mesa;
use App\Models\MovimientoInventario;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Producto;
use App\Models\SerieDocumento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * API del Punto de Venta (POS).
 *
 * Agrupa las operaciones de salón que el frontend consume desde
 * `pos.service.ts`: mapa de mesas en vivo, toma de pedido, carrito,
 * opciones, mover de mesa y cobro.
 */
class PosController extends Controller
{
    /**
     * Mapa de mesas con su estado en vivo.
     *
     * El estado se deriva del pedido pendiente activo de cada mesa;
     * si no hay pedido se respeta el estado manual (`reservada`).
     */
    public function mapaMesas(): JsonResponse
    {
        $mesas = Mesa::with('area')
            ->orderBy('area_id')
            ->orderBy('pos_y')
            ->orderBy('pos_x')
            ->get();

        // Pedidos pendientes con sus líneas, indexados por mesa.
        $pedidos = Pedido::with('detalles')
            ->where('estado', 'pendiente')
            ->whereNotNull('mesa_id')
            ->get()
            ->keyBy('mesa_id');

        $resultado = $mesas->map(function (Mesa $mesa) use ($pedidos) {
            $pedido = $pedidos->get($mesa->id);

            if ($pedido) {
                $estado = 'ocupada';
                $total = (float) $pedido->detalles->sum(
                    fn (PedidoDetalle $d) => (float) $d->precio * $d->cantidad
                );
            } elseif ($mesa->estado === 'reservada') {
                $estado = 'reservada';
                $total = null;
            } else {
                $estado = 'libre';
                $total = null;
            }

            return [
                'mesa' => $mesa,
                'estado' => $estado,
                'total' => $total,
            ];
        })->values();

        return response()->json($resultado);
    }

    /**
     * Pantalla de pedido de una mesa: pedido activo, sus líneas y mesas libres.
     */
    public function obtenerPedido(Mesa $mesa): JsonResponse
    {
        $mesa->load('area');

        $pedido = Pedido::with('detalles.producto')
            ->where('mesa_id', $mesa->id)
            ->where('estado', 'pendiente')
            ->latest('id')
            ->first();

        $mesasLibres = $this->mesasLibres($mesa->id);

        return response()->json([
            'mesa' => $mesa,
            'pedido' => $pedido,
            'detalles' => $pedido?->detalles ?? [],
            'mesasLibres' => $mesasLibres,
        ]);
    }

    /**
     * Categorías activas con sus productos vendibles y activos.
     */
    public function categoriasConProductos(): JsonResponse
    {
        $categorias = Categoria::where('activo', true)
            ->with(['productos' => fn ($q) => $q
                ->where('activo', true)
                ->where('vendible', true)
                ->orderBy('nombre')])
            ->orderBy('nombre')
            ->get();

        return response()->json($categorias);
    }

    /**
     * Agrega un producto al pedido de la mesa (crea la orden si no existe).
     */
    public function agregarProducto(Request $request, Mesa $mesa): JsonResponse
    {
        $datos = $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'nullable|integer|min:1|max:999',
            'pedido_id' => 'nullable|integer|exists:pedidos,id',
        ]);

        $cantidad = $datos['cantidad'] ?? 1;
        $producto = Producto::findOrFail($datos['producto_id']);

        if ($producto->stock !== null && $producto->stock < $cantidad) {
            return response()->json(['error' => 'Stock insuficiente.'], 422);
        }

        $pedido = DB::transaction(function () use ($request, $mesa, $datos, $cantidad, $producto) {
            $pedido = null;

            if (! empty($datos['pedido_id'])) {
                $pedido = Pedido::where('id', $datos['pedido_id'])
                    ->where('estado', 'pendiente')
                    ->first();
            }

            if (! $pedido) {
                $pedido = Pedido::where('mesa_id', $mesa->id)
                    ->where('estado', 'pendiente')
                    ->latest('id')
                    ->first();
            }

            if (! $pedido) {
                $cajaAbierta = Caja::where('usuario_id', $request->user()->id)
                    ->where('estado', 'abierta')
                    ->first();

                $pedido = Pedido::create([
                    'mesa_id' => $mesa->id,
                    'usuario_id' => $request->user()->id,
                    'caja_id' => $cajaAbierta?->id,
                    'estado' => 'pendiente',
                    'tipo_comprobante' => 'ticket',
                ]);
            }

            $pedido->detalles()->create([
                'producto_id' => $producto->id,
                'cantidad' => $cantidad,
                'precio' => $producto->precio_promocional ?? $producto->precio,
                'estado' => 'pendiente',
            ]);

            $mesa->update(['estado' => 'ocupada']);

            $this->recalcular($pedido);

            return $pedido;
        });

        return response()->json($pedido->fresh(['detalles.producto']));
    }

    /**
     * Actualiza la cantidad de una línea del carrito.
     */
    public function actualizarCantidad(Request $request, PedidoDetalle $detalle): JsonResponse
    {
        $datos = $request->validate([
            'cantidad' => 'required|integer|min:1|max:999',
        ]);

        $detalle->update(['cantidad' => $datos['cantidad']]);
        $this->recalcular($detalle->pedido);

        return response()->json($detalle->fresh('producto'));
    }

    /**
     * Guarda la nota de cocina de una línea.
     */
    public function guardarNota(Request $request, PedidoDetalle $detalle): JsonResponse
    {
        $datos = $request->validate([
            'nota' => 'nullable|string|max:255',
        ]);

        $detalle->update(['nota' => $datos['nota'] ?? null]);

        return response()->json($detalle->fresh('producto'));
    }

    /**
     * Elimina una línea del carrito. Si el pedido queda sin líneas se elimina
     * y la mesa vuelve a quedar libre.
     */
    public function eliminarLinea(PedidoDetalle $detalle): JsonResponse
    {
        $pedido = $detalle->pedido()->with('detalles')->first();

        if ($pedido && $pedido->estado === 'pendiente') {
            $detalle->delete();

            if ($pedido->detalles()->count() === 0) {
                $this->liberarMesa($pedido);
                $pedido->delete();
            } else {
                $this->recalcular($pedido);
            }
        } else {
            $detalle->delete();
        }

        return response()->json(null, 204);
    }

    /**
     * Aplica descuento y/o propina al pedido.
     */
    public function aplicarOpciones(Request $request, Pedido $pedido): JsonResponse
    {
        $datos = $request->validate([
            'descuento' => 'nullable|numeric|min:0',
            'propina' => 'nullable|numeric|min:0',
        ]);

        $pedido->update([
            'descuento' => $datos['descuento'] ?? 0,
            'propina' => $datos['propina'] ?? 0,
        ]);

        $this->recalcular($pedido);

        return response()->json($pedido->fresh(['detalles.producto']));
    }

    /**
     * Mueve el pedido a otra mesa libre.
     */
    public function moverMesa(Request $request, Pedido $pedido): JsonResponse
    {
        $datos = $request->validate([
            'mesa_id' => 'required|integer|exists:mesas,id',
        ]);

        if ($pedido->estado !== 'pendiente') {
            return response()->json(['error' => 'Solo se pueden mover pedidos pendientes.'], 422);
        }

        $destino = Mesa::findOrFail($datos['mesa_id']);

        if ($destino->id === $pedido->mesa_id) {
            return response()->json(['error' => 'El pedido ya está en esa mesa.'], 422);
        }

        $ocupada = Pedido::where('mesa_id', $destino->id)
            ->where('estado', 'pendiente')
            ->exists();

        if ($ocupada) {
            return response()->json(['error' => 'La mesa destino está ocupada.'], 422);
        }

        $origen = $pedido->mesa;

        $pedido->update(['mesa_id' => $destino->id]);
        $destino->update(['estado' => 'ocupada']);
        $origen?->update(['estado' => 'libre']);

        return response()->json($pedido->fresh(['mesa.area', 'detalles.producto']));
    }

    /**
     * Cobra el pedido: calcula totales, genera comprobante, libera la mesa y
     * descuenta stock con su kardex.
     */
    public function cobrar(Request $request, Pedido $pedido): JsonResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return response()->json(['error' => 'El pedido ya fue procesado.'], 422);
        }

        $datos = $request->validate([
            'cliente_id' => 'nullable|integer|exists:clientes,id',
            'nombre_cliente' => 'nullable|string|max:255',
            'documento_cliente' => 'nullable|string|max:255',
            'tipo_comprobante' => 'required|in:ticket,boleta,factura',
            'metodo_pago' => 'required|in:efectivo,tarjeta',
            'monto_recibido' => 'nullable|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'propina' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $pedido, $datos) {
            $pedido->load('detalles.producto');

            $subtotal = (float) $pedido->detalles->sum(
                fn (PedidoDetalle $d) => (float) $d->precio * $d->cantidad
            );
            $descuento = (float) ($datos['descuento'] ?? $pedido->descuento ?? 0);
            $propina = (float) ($datos['propina'] ?? $pedido->propina ?? 0);

            // Precios con IGV incluido: se desagrega para el comprobante.
            $total = max(0, $subtotal - $descuento + $propina);
            $gravado = round($total / 1.18, 2);
            $igv = round($total - $gravado, 2);

            // Numeración del comprobante para boleta/factura.
            $serie = null;
            $correlativo = null;
            if (in_array($datos['tipo_comprobante'], ['boleta', 'factura'], true)) {
                $serieDoc = SerieDocumento::where('tipo_documento', $datos['tipo_comprobante'])
                    ->where('activo', true)
                    ->first();
                if ($serieDoc) {
                    $correlativo = SerieDocumento::siguiente($serieDoc->serie);
                    $serie = $serieDoc->serie;
                }
            }

            $montoRecibido = $datos['monto_recibido'] ?? null;

            $pedido->update([
                'estado' => 'completada',
                'cliente_id' => $datos['cliente_id'] ?? null,
                'nombre_cliente' => $datos['nombre_cliente'] ?: 'Público general',
                'documento_cliente' => $datos['documento_cliente'] ?? null,
                'tipo_comprobante' => $datos['tipo_comprobante'],
                'metodo_pago' => $datos['metodo_pago'],
                'monto_recibido' => $montoRecibido,
                'vuelto' => $montoRecibido !== null ? max(0, $montoRecibido - $total) : 0,
                'descuento' => $descuento,
                'propina' => $propina,
                'subtotal' => $total,
                'igv' => $igv,
                'total' => $total,
                'total_gravado' => $gravado,
                'serie' => $serie,
                'correlativo' => $correlativo,
            ]);

            $this->liberarMesa($pedido);

            // Descontar stock y registrar kardex.
            foreach ($pedido->detalles as $detalle) {
                $producto = $detalle->producto;
                if ($producto && $producto->stock !== null) {
                    $stockAnterior = $producto->stock;
                    $stockNuevo = $stockAnterior - $detalle->cantidad;
                    $producto->update(['stock' => $stockNuevo]);

                    MovimientoInventario::create([
                        'producto_id' => $producto->id,
                        'usuario_id' => $request->user()->id,
                        'tipo' => 'venta',
                        'cantidad' => -$detalle->cantidad,
                        'stock_anterior' => $stockAnterior,
                        'stock_nuevo' => $stockNuevo,
                        'nota' => 'Venta POS #' . $pedido->id,
                    ]);
                }
            }
        });

        return response()->json([
            'pedido' => $pedido->fresh(['detalles.producto']),
            'mensaje' => 'Cobro registrado correctamente.',
        ]);
    }

    /**
     * Busca clientes por nombre o documento para el cobro.
     */
    public function buscarClientes(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $clientes = Cliente::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where('nombre', 'like', "%{$q}%")
                    ->orWhere('numero_documento', 'like', "%{$q}%");
            })
            ->orderBy('nombre')
            ->limit(20)
            ->get()
            ->map(fn (Cliente $c) => [
                'id' => $c->id,
                'nombre' => $c->nombre,
                'documento' => $c->numero_documento,
            ]);

        return response()->json($clientes);
    }

    /**
     * Recalcula los totales de un pedido pendiente a partir de sus líneas.
     * Los precios ya incluyen IGV, por lo que el total no vuelve a sumarlo.
     */
    protected function recalcular(Pedido $pedido): void
    {
        $pedido->load('detalles');

        $subtotal = (float) $pedido->detalles->sum(
            fn (PedidoDetalle $d) => (float) $d->precio * $d->cantidad
        );
        $descuento = (float) $pedido->descuento;
        $propina = (float) $pedido->propina;
        $total = max(0, $subtotal - $descuento + $propina);
        $gravado = round($total / 1.18, 2);

        $pedido->update([
            'subtotal' => $total,
            'total' => $total,
            'total_gravado' => $gravado,
            'igv' => round($total - $gravado, 2),
        ]);
    }

    /**
     * Marca la mesa del pedido como libre (si tenía mesa).
     */
    protected function liberarMesa(Pedido $pedido): void
    {
        if ($pedido->mesa_id) {
            Mesa::where('id', $pedido->mesa_id)->update(['estado' => 'libre']);
        }
    }

    /**
     * Mesas sin pedido pendiente (excluye la mesa indicada).
     */
    protected function mesasLibres(?int $exceptoId = null)
    {
        return Mesa::with('area')
            ->when($exceptoId, fn ($q) => $q->where('id', '!=', $exceptoId))
            ->whereDoesntHave('pedidos', fn ($q) => $q->where('estado', 'pendiente'))
            ->where('estado', '!=', 'reservada')
            ->orderBy('area_id')
            ->orderBy('nombre')
            ->get();
    }
}

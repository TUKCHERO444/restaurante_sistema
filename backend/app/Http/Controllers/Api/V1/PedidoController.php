<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Producto;
use App\Models\Mesa;
use App\Models\Cliente;
use App\Models\Caja;
use App\Models\SerieDocumento;
use App\Models\MovimientoInventario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** CRUD de pedidos con checkout, gestión de stock y numeración de comprobantes. */
class PedidoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Pedido::with(['mesa', 'usuario', 'cliente'])->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());
        $datos['usuario_id'] = $request->user()->id;
        $datos['estado'] = 'pendiente';

        // Caja activa del usuario
        $cajaAbierta = Caja::where('usuario_id', $request->user()->id)
            ->where('estado', 'abierta')
            ->first();
        $datos['caja_id'] = $cajaAbierta?->id;

        return response()->json(Pedido::create($datos), 201);
    }

    public function show(Pedido $pedido): JsonResponse
    {
        return response()->json($pedido->load(['mesa', 'usuario', 'cliente', 'caja', 'detalles.producto', 'reparto']));
    }

    public function update(Request $request, Pedido $pedido): JsonResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return response()->json(['error' => 'Solo se pueden editar pedidos pendientes.'], 422);
        }

        $datos = $request->validate($this->reglas(true));
        $pedido->update($datos);

        return response()->json($pedido);
    }

    public function destroy(Pedido $pedido): JsonResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return response()->json(['error' => 'Solo se pueden eliminar pedidos pendientes.'], 422);
        }

        $pedido->delete();

        return response()->json(null, 204);
    }

    /**
     * Agregar producto al pedido.
     */
    public function addDetalle(Request $request, Pedido $pedido): JsonResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return response()->json(['error' => 'Solo se pueden agregar productos a pedidos pendientes.'], 422);
        }

        $datos = $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'required|integer|min:1|max:999',
            'nota' => 'nullable|string|max:255',
        ]);

        $producto = Producto::findOrFail($datos['producto_id']);

        // Verificar stock
        if ($producto->stock !== null && $producto->stock < $datos['cantidad']) {
            return response()->json(['error' => 'Stock insuficiente.'], 422);
        }

        $detalle = $pedido->detalles()->create([
            'producto_id' => $producto->id,
            'cantidad' => $datos['cantidad'],
            'precio' => $producto->precio_promocional ?? $producto->precio,
            'nota' => $datos['nota'] ?? null,
            'estado' => 'pendiente',
        ]);

        return response()->json($detalle, 201);
    }

    /**
     * Actualizar cantidad de un detalle.
     */
    public function updateDetalle(Request $request, Pedido $pedido, PedidoDetalle $detalle): JsonResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return response()->json(['error' => 'Solo se pueden modificar pedidos pendientes.'], 422);
        }

        $datos = $request->validate([
            'cantidad' => 'required|integer|min:1|max:999',
        ]);

        $detalle->update(['cantidad' => $datos['cantidad']]);

        return response()->json($detalle);
    }

    /**
     * Eliminar detalle del pedido.
     */
    public function removeDetalle(Pedido $pedido, PedidoDetalle $detalle): JsonResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return response()->json(['error' => 'Solo se pueden modificar pedidos pendientes.'], 422);
        }

        $detalle->delete();

        return response()->json(null, 204);
    }

    /**
     * Checkout: completar pedido, calcular totales, descontar stock, generar comprobante.
     */
    public function checkout(Request $request, Pedido $pedido): JsonResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return response()->json(['error' => 'El pedido ya fue procesado.'], 422);
        }

        $datos = $request->validate([
            'tipo_comprobante' => 'required|in:ticket,boleta,factura',
            'metodo_pago' => 'required|in:efectivo,tarjeta',
            'monto_recibido' => 'nullable|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'propina' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $pedido, $datos) {
            // Calcular totales
            $subtotal = $pedido->detalles->sum(fn ($d) => $d->precio * $d->cantidad);
            $descuento = $datos['descuento'] ?? 0;
            $propina = $datos['propina'] ?? 0;
            $igv = ($subtotal - $descuento) * 0.18;
            $total = $subtotal - $descuento + $igv + $propina;

            // Generar comprobante si es boleta/factura
            $serie = null;
            $correlativo = null;
            if (in_array($datos['tipo_comprobante'], ['boleta', 'factura'])) {
                $tipoDoc = $datos['tipo_comprobante'] === 'boleta' ? 'boleta' : 'factura';
                $serieDoc = SerieDocumento::where('tipo_documento', $tipoDoc)->where('activo', true)->first();
                if ($serieDoc) {
                    $correlativo = SerieDocumento::siguiente($serieDoc->serie);
                    $serie = $serieDoc->serie;
                }
            }

            // Actualizar pedido
            $pedido->update([
                'estado' => 'completada',
                'tipo_comprobante' => $datos['tipo_comprobante'],
                'metodo_pago' => $datos['metodo_pago'],
                'monto_recibido' => $datos['monto_recibido'] ?? null,
                'vuelto' => isset($datos['monto_recibido']) ? $datos['monto_recibido'] - $total : 0,
                'descuento' => $descuento,
                'propina' => $propina,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
                'total_gravado' => $subtotal - $descuento,
                'serie' => $serie,
                'correlativo' => $correlativo,
            ]);

            // Actualizar estado de mesa
            if ($pedido->mesa_id) {
                $pedido->mesa->update(['estado' => 'ocupada']);
            }

            // Descontar stock y registrar kardex
            foreach ($pedido->detalles as $detalle) {
                $producto = $detalle->producto;
                if ($producto->stock !== null) {
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
                        'nota' => 'Venta #' . $pedido->id,
                    ]);
                }
            }
        });

        return response()->json($pedido->fresh(['detalles.producto']));
    }

    /**
     * Cancelar pedido.
     */
    public function cancelar(Pedido $pedido): JsonResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return response()->json(['error' => 'Solo se pueden cancelar pedidos pendientes.'], 422);
        }

        $pedido->update(['estado' => 'anulada']);

        return response()->json($pedido);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'mesa_id' => "{$opcional}nullable|exists:mesas,id",
            'usuario_id' => "{$opcional}required|exists:usuarios,id",
            'cliente_id' => "{$opcional}nullable|exists:clientes,id",
            'caja_id' => "{$opcional}nullable|exists:cajas,id",
            'estado' => "{$opcional}nullable|in:pendiente,completada,anulada",
            'tipo_comprobante' => "{$opcional}nullable|in:ticket,boleta,factura",
            'nombre_cliente' => "{$opcional}nullable|string|max:255",
            'documento_cliente' => "{$opcional}nullable|string|max:255",
            'notas' => "{$opcional}nullable|string",
        ];
    }
}

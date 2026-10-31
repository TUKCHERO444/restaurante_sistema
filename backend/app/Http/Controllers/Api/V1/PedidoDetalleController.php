<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PedidoDetalle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de líneas de pedido (cola de cocina). */
class PedidoDetalleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(PedidoDetalle::with(['pedido', 'producto'])->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(PedidoDetalle::create($datos), 201);
    }

    public function show(PedidoDetalle $detalle): JsonResponse
    {
        return response()->json($detalle->load(['pedido', 'producto']));
    }

    public function update(Request $request, PedidoDetalle $detalle): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $detalle->update($datos);

        return response()->json($detalle);
    }

    public function destroy(PedidoDetalle $detalle): JsonResponse
    {
        $detalle->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'pedido_id' => "{$opcional}required|exists:pedidos,id",
            'producto_id' => "{$opcional}required|exists:productos,id",
            'cantidad' => "{$opcional}nullable|integer|min:1",
            'precio' => "{$opcional}required|numeric|min:0",
            'nota' => "{$opcional}nullable|string|max:255",
            'estado' => "{$opcional}nullable|in:pendiente,en_cocina,servido",
        ];
    }
}

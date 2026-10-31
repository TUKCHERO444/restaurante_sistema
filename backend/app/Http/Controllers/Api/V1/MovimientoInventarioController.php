<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MovimientoInventario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Kardex en solo lectura + registro manual. Sin descuento automático todavía. */
class MovimientoInventarioController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(MovimientoInventario::with(['producto', 'usuario'])->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(MovimientoInventario::create($datos), 201);
    }

    public function show(MovimientoInventario $movimiento): JsonResponse
    {
        return response()->json($movimiento->load(['producto', 'usuario']));
    }

    public function update(Request $request, MovimientoInventario $movimiento): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $movimiento->update($datos);

        return response()->json($movimiento);
    }

    public function destroy(MovimientoInventario $movimiento): JsonResponse
    {
        $movimiento->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'producto_id' => "{$opcional}required|exists:productos,id",
            'usuario_id' => "{$opcional}required|exists:usuarios,id",
            'tipo' => "{$opcional}required|in:venta,compra,ajuste",
            'cantidad' => "{$opcional}required|integer",
            'stock_anterior' => "{$opcional}nullable|integer",
            'stock_nuevo' => "{$opcional}nullable|integer",
            'nota' => "{$opcional}nullable|string|max:255",
        ];
    }
}

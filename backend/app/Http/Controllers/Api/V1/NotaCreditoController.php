<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NotaCredito;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de notas de crédito. Sin envío SUNAT todavía. */
class NotaCreditoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(NotaCredito::with('pedido')->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(NotaCredito::create($datos), 201);
    }

    public function show(NotaCredito $nota): JsonResponse
    {
        return response()->json($nota->load(['pedido', 'usuario']));
    }

    public function update(Request $request, NotaCredito $nota): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $nota->update($datos);

        return response()->json($nota);
    }

    public function destroy(NotaCredito $nota): JsonResponse
    {
        $nota->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'pedido_id' => "{$opcional}required|exists:pedidos,id",
            'serie' => "{$opcional}required|string|size:4",
            'correlativo' => "{$opcional}required|integer|min:1",
            'tipo_documento' => "{$opcional}nullable|string|max:30",
            'codigo_motivo' => "{$opcional}required|string|size:2",
            'descripcion_motivo' => "{$opcional}required|string|max:255",
            'subtotal' => "{$opcional}nullable|numeric|min:0",
            'igv' => "{$opcional}nullable|numeric|min:0",
            'total' => "{$opcional}nullable|numeric|min:0",
            'usuario_id' => "{$opcional}nullable|exists:usuarios,id",
        ];
    }
}

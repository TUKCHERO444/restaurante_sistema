<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Gasto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de gastos. */
class GastoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Gasto::with(['usuario', 'caja'])->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(Gasto::create($datos), 201);
    }

    public function show(Gasto $gasto): JsonResponse
    {
        return response()->json($gasto->load(['usuario', 'caja']));
    }

    public function update(Request $request, Gasto $gasto): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $gasto->update($datos);

        return response()->json($gasto);
    }

    public function destroy(Gasto $gasto): JsonResponse
    {
        $gasto->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'concepto' => "{$opcional}required|string|max:255",
            'monto' => "{$opcional}required|numeric|min:0",
            'usuario_id' => "{$opcional}required|exists:usuarios,id",
            'caja_id' => "{$opcional}nullable|exists:cajas,id",
        ];
    }
}

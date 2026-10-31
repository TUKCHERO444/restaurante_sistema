<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Caja;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de turnos de caja. Sin apertura/cierre calculado todavía. */
class CajaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Caja::with('usuario')->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(Caja::create($datos), 201);
    }

    public function show(Caja $caja): JsonResponse
    {
        return response()->json($caja->load(['usuario', 'pedidos', 'gastos']));
    }

    public function update(Request $request, Caja $caja): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $caja->update($datos);

        return response()->json($caja);
    }

    public function destroy(Caja $caja): JsonResponse
    {
        $caja->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'usuario_id' => "{$opcional}required|exists:usuarios,id",
            'apertura_en' => "{$opcional}required|date",
            'cierre_en' => "{$opcional}nullable|date",
            'monto_apertura' => "{$opcional}required|numeric|min:0",
            'monto_cierre' => "{$opcional}nullable|numeric|min:0",
            'estado' => "{$opcional}nullable|in:abierta,cerrada",
            'notas' => "{$opcional}nullable|string",
        ];
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ResumenDiario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de resúmenes diarios (RC). Sin generación ni envío SUNAT todavía. */
class ResumenDiarioController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(ResumenDiario::paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(ResumenDiario::create($datos), 201);
    }

    public function show(ResumenDiario $resumen): JsonResponse
    {
        return response()->json($resumen->load('usuario'));
    }

    public function update(Request $request, ResumenDiario $resumen): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $resumen->update($datos);

        return response()->json($resumen);
    }

    public function destroy(ResumenDiario $resumen): JsonResponse
    {
        $resumen->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'fecha_referencia' => "{$opcional}required|date",
            'fecha_generacion' => "{$opcional}required|date",
            'correlativo' => "{$opcional}required|integer|min:1",
            'identificador' => "{$opcional}required|string|max:30",
            'usuario_id' => "{$opcional}nullable|exists:usuarios,id",
        ];
    }
}

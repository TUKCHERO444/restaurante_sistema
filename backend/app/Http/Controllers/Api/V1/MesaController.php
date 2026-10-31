<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Mesa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de mesas (incluye posición en el plano). */
class MesaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Permite a los listados sin paginación de UI (p. ej. el diseñador de
        // salón) solicitar todos los registros mediante ?per_page=.
        $porPagina = max(1, min($request->integer('per_page', 15), 500));

        return response()->json(Mesa::with('area')->paginate($porPagina));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(Mesa::create($datos), 201);
    }

    public function show(Mesa $mesa): JsonResponse
    {
        return response()->json($mesa->load(['area', 'pedidos']));
    }

    public function update(Request $request, Mesa $mesa): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $mesa->update($datos);

        return response()->json($mesa);
    }

    public function destroy(Mesa $mesa): JsonResponse
    {
        $mesa->delete();

        return response()->json(null, 204);
    }

    /**
     * Actualiza las posiciones de múltiples mesas en una sola petición.
     * Recibe: { posiciones: [{ id, x, y }, ...] }
     */
    public function updatePositions(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'posiciones' => 'required|array',
            'posiciones.*.id' => 'required|integer|exists:mesas,id',
            'posiciones.*.x' => 'required|integer',
            'posiciones.*.y' => 'required|integer',
        ]);

        foreach ($datos['posiciones'] as $pos) {
            Mesa::where('id', $pos['id'])->update([
                'pos_x' => $pos['x'],
                'pos_y' => $pos['y'],
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Posiciones actualizadas correctamente',
        ]);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'area_id' => "{$opcional}required|exists:areas,id",
            'nombre' => "{$opcional}required|string|max:255",
            'asientos' => "{$opcional}nullable|integer|min:1",
            'estado' => "{$opcional}nullable|in:libre,ocupada,reservada",
            'pos_x' => "{$opcional}nullable|integer",
            'pos_y' => "{$opcional}nullable|integer",
        ];
    }
}

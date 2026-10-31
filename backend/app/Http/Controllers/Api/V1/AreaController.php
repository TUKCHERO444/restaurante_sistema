<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de áreas del salón. */
class AreaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Permite a los listados sin paginación de UI solicitar todos los
        // registros mediante ?per_page=.
        $porPagina = max(1, min($request->integer('per_page', 15), 500));

        return response()->json(Area::paginate($porPagina));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(Area::create($datos), 201);
    }

    public function show(Area $area): JsonResponse
    {
        return response()->json($area->load('mesas'));
    }

    public function update(Request $request, Area $area): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $area->update($datos);

        return response()->json($area);
    }

    public function destroy(Area $area): JsonResponse
    {
        $area->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return ['nombre' => "{$opcional}required|string|max:255"];
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Repartidor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de repartidores. */
class RepartidorController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Repartidor::paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(Repartidor::create($datos), 201);
    }

    public function show(Repartidor $repartidor): JsonResponse
    {
        return response()->json($repartidor->load('repartos'));
    }

    public function update(Request $request, Repartidor $repartidor): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $repartidor->update($datos);

        return response()->json($repartidor);
    }

    public function destroy(Repartidor $repartidor): JsonResponse
    {
        $repartidor->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'nombre' => "{$opcional}required|string|max:255",
            'telefono' => "{$opcional}nullable|string|max:255",
            'activo' => "{$opcional}nullable|boolean",
        ];
    }
}

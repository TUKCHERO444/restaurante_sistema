<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de categorías del catálogo. */
class CategoriaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Categoria::paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(Categoria::create($datos), 201);
    }

    public function show(Categoria $categoria): JsonResponse
    {
        return response()->json($categoria->load('productos'));
    }

    public function update(Request $request, Categoria $categoria): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $categoria->update($datos);

        return response()->json($categoria);
    }

    public function destroy(Categoria $categoria): JsonResponse
    {
        $categoria->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'nombre' => "{$opcional}required|string|max:255",
            'imagen' => "{$opcional}nullable|string|max:255",
            'activo' => "{$opcional}nullable|boolean",
        ];
    }
}

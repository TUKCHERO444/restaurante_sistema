<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de productos (vendibles e insumos). Sin recetas ni stock todavía. */
class ProductoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Producto::with('categoria')->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(Producto::create($datos), 201);
    }

    public function show(Producto $producto): JsonResponse
    {
        return response()->json($producto->load(['categoria', 'ingredientes']));
    }

    public function update(Request $request, Producto $producto): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $producto->update($datos);

        return response()->json($producto);
    }

    public function destroy(Producto $producto): JsonResponse
    {
        $producto->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'categoria_id' => "{$opcional}required|exists:categorias,id",
            'nombre' => "{$opcional}required|string|max:255",
            'codigo' => "{$opcional}nullable|string|max:255",
            'codigo_barras' => "{$opcional}nullable|string|max:255|unique:productos,codigo_barras",
            'precio' => "{$opcional}required|numeric|min:0",
            'precio_promocional' => "{$opcional}nullable|numeric|min:0",
            'costo' => "{$opcional}nullable|numeric|min:0",
            'stock' => "{$opcional}nullable|integer",
            'vendible' => "{$opcional}nullable|boolean",
            'imagen' => "{$opcional}nullable|string|max:255",
            'activo' => "{$opcional}nullable|boolean",
            'recomendado_chef' => "{$opcional}nullable|boolean",
            'nuevo' => "{$opcional}nullable|boolean",
        ];
    }
}

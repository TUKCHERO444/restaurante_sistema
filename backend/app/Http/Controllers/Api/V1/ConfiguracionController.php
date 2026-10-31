<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de configuraciones clave-valor (empresa + SUNAT). */
class ConfiguracionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Configuracion::paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(Configuracion::create($datos), 201);
    }

    public function show(Configuracion $configuracion): JsonResponse
    {
        return response()->json($configuracion);
    }

    public function update(Request $request, Configuracion $configuracion): JsonResponse
    {
        $datos = $request->validate($this->reglas(true, $configuracion->id));
        $configuracion->update($datos);

        return response()->json($configuracion);
    }

    public function destroy(Configuracion $configuracion): JsonResponse
    {
        $configuracion->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false, ?int $id = null): array
    {
        $opcional = $parcial ? 'sometimes|' : '';
        $unique = $id ? "|unique:configuraciones,clave,{$id}" : '|unique:configuraciones,clave';

        return [
            'clave' => "{$opcional}required|string|max:255{$unique}",
            'valor' => "{$opcional}nullable|string",
        ];
    }
}

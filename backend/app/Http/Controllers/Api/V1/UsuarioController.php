<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de usuarios. Sin lógica de roles ni autenticación todavía. */
class UsuarioController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Usuario::paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(Usuario::create($datos), 201);
    }

    public function show(Usuario $usuario): JsonResponse
    {
        return response()->json($usuario);
    }

    public function update(Request $request, Usuario $usuario): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $usuario->update($datos);

        return response()->json($usuario);
    }

    public function destroy(Usuario $usuario): JsonResponse
    {
        $usuario->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'nombre' => "{$opcional}required|string|max:255",
            'correo' => "{$opcional}required|email|max:255|unique:usuarios,correo",
            'contrasena' => "{$opcional}required|string|min:8",
            'rol' => "{$opcional}required|in:administrador,cajero,mozo,cocina",
        ];
    }
}

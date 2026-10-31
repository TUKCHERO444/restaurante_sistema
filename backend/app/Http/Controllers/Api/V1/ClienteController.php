<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de clientes. */
class ClienteController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Cliente::paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(Cliente::create($datos), 201);
    }

    public function show(Cliente $cliente): JsonResponse
    {
        return response()->json($cliente->load('pedidos'));
    }

    public function update(Request $request, Cliente $cliente): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $cliente->update($datos);

        return response()->json($cliente);
    }

    public function destroy(Cliente $cliente): JsonResponse
    {
        $cliente->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'nombre' => "{$opcional}required|string|max:255",
            'tipo_documento' => "{$opcional}nullable|string|max:255",
            'numero_documento' => "{$opcional}nullable|string|max:255|unique:clientes,numero_documento",
            'correo' => "{$opcional}nullable|email|max:255",
            'telefono' => "{$opcional}nullable|string|max:255",
            'direccion' => "{$opcional}nullable|string|max:255",
        ];
    }
}

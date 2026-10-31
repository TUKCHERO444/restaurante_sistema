<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de reservas. Sin confirmaciones ni agenda todavía. */
class ReservaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Reserva::with('mesa')->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(Reserva::create($datos), 201);
    }

    public function show(Reserva $reserva): JsonResponse
    {
        return response()->json($reserva->load('mesa'));
    }

    public function update(Request $request, Reserva $reserva): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $reserva->update($datos);

        return response()->json($reserva);
    }

    public function destroy(Reserva $reserva): JsonResponse
    {
        $reserva->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'nombre_cliente' => "{$opcional}required|string|max:255",
            'telefono' => "{$opcional}nullable|string|max:255",
            'fecha_reserva' => "{$opcional}required|date",
            'personas' => "{$opcional}required|integer|min:1",
            'mesa_id' => "{$opcional}nullable|exists:mesas,id",
            'nota' => "{$opcional}nullable|string",
            'estado' => "{$opcional}nullable|in:pendiente,confirmada,cancelada",
        ];
    }
}

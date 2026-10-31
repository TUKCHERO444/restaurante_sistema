<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Reparto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de repartos (delivery). Sin kanban ni cobro todavía. */
class RepartoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Reparto::with(['pedido', 'repartidor'])->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(Reparto::create($datos), 201);
    }

    public function show(Reparto $reparto): JsonResponse
    {
        return response()->json($reparto->load(['pedido', 'cliente', 'repartidor', 'usuario', 'caja']));
    }

    public function update(Request $request, Reparto $reparto): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $reparto->update($datos);

        return response()->json($reparto);
    }

    public function destroy(Reparto $reparto): JsonResponse
    {
        $reparto->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'pedido_id' => "{$opcional}required|exists:pedidos,id",
            'cliente_id' => "{$opcional}nullable|exists:clientes,id",
            'nombre_cliente' => "{$opcional}required|string|max:255",
            'telefono_cliente' => "{$opcional}required|string|max:255",
            'direccion' => "{$opcional}required|string",
            'referencia' => "{$opcional}nullable|string|max:255",
            'repartidor_id' => "{$opcional}nullable|exists:repartidores,id",
            'usuario_id' => "{$opcional}required|exists:usuarios,id",
            'caja_id' => "{$opcional}nullable|exists:cajas,id",
            'estado' => "{$opcional}nullable|in:pendiente,en_preparacion,en_camino,entregado,cancelado",
            'metodo_pago' => "{$opcional}nullable|in:efectivo,tarjeta,transferencia",
            'costo_envio' => "{$opcional}nullable|numeric|min:0",
            'notas' => "{$opcional}nullable|string",
            'programado_para' => "{$opcional}nullable|date",
        ];
    }
}

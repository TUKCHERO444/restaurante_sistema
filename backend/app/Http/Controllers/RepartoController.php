<?php

namespace App\Http\Controllers;

use App\Http\Requests\RepartoFormRequest;
use App\Models\Reparto;
use App\Models\Pedido;
use App\Models\Cliente;
use App\Models\Repartidor;
use App\Models\Caja;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;

class RepartoController extends Controller
{
    public function index(Request $request): View
    {
        $repartos = Reparto::with(['pedido', 'cliente', 'repartidor', 'usuario'])
            ->orderBy('creado_en', 'desc')
            ->get();
        return view('repartos.index', compact('repartos'));
    }

    public function create(): View
    {
        $clientes = Cliente::orderBy('nombre')->get();
        $repartidores = Repartidor::where('activo', true)->orderBy('nombre')->get();
        $productos = \App\Models\Producto::where('activo', true)->where('vendible', true)->orderBy('nombre')->get();
        return view('repartos.create', compact('clientes', 'repartidores', 'productos'));
    }

    public function store(RepartoFormRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            // Crear pedido asociado
            $cajaAbierta = Caja::where('usuario_id', auth()->id())
                ->where('estado', 'abierta')
                ->first();

            $pedido = Pedido::create([
                'usuario_id' => auth()->id(),
                'cliente_id' => $request->input('cliente_id'),
                'nombre_cliente' => $request->input('nombre_cliente'),
                'tipo_comprobante' => 'ticket',
                'metodo_pago' => $request->input('metodo_pago'),
                'estado' => 'pendiente',
                'caja_id' => $cajaAbierta?->id,
            ]);

            // Crear reparto
            $reparto = Reparto::create([
                'pedido_id' => $pedido->id,
                'cliente_id' => $request->input('cliente_id'),
                'nombre_cliente' => $request->input('nombre_cliente'),
                'telefono_cliente' => $request->input('telefono_cliente'),
                'direccion' => $request->input('direccion'),
                'referencia' => $request->input('referencia'),
                'repartidor_id' => $request->input('repartidor_id'),
                'usuario_id' => auth()->id(),
                'caja_id' => $cajaAbierta?->id,
                'estado' => 'pendiente',
                'metodo_pago' => $request->input('metodo_pago'),
                'costo_envio' => $request->input('costo_envio', 0),
                'notas' => $request->input('notas'),
                'programado_para' => $request->input('programado_para'),
            ]);

            return $reparto;
        });

        return redirect()->route('repartos.index')
            ->with('success', 'Reparto creado exitosamente.');
    }

    public function show(Reparto $reparto): View
    {
        $reparto->load(['pedido.detalles.producto', 'cliente', 'repartidor', 'usuario']);
        return view('repartos.show', compact('reparto'));
    }

    public function edit(Reparto $reparto): View
    {
        $clientes = Cliente::orderBy('nombre')->get();
        $repartidores = Repartidor::where('activo', true)->orderBy('nombre')->get();
        return view('repartos.edit', compact('reparto', 'clientes', 'repartidores'));
    }

    public function update(RepartoFormRequest $request, Reparto $reparto): RedirectResponse
    {
        $reparto->update($request->validated());

        return redirect()->route('repartos.show', $reparto)
            ->with('success', 'Reparto actualizado exitosamente.');
    }

    public function destroy(Reparto $reparto): RedirectResponse
    {
        if ($reparto->estado === 'entregado') {
            return redirect()->route('repartos.index')
                ->with('error', 'No se puede eliminar un reparto entregado.');
        }

        $reparto->delete();

        return redirect()->route('repartos.index')
            ->with('success', 'Reparto eliminado exitosamente.');
    }

    /**
     * Cambiar estado del reparto.
     */
    public function updateStatus(Request $request, Reparto $reparto): RedirectResponse
    {
        $request->validate([
            'estado' => 'required|in:pendiente,en_preparacion,en_camino,entregado,cancelado',
        ]);

        $data = ['estado' => $request->input('estado')];

        if ($request->input('estado') === 'entregado') {
            $data['entregado_en'] = now();
        }

        $reparto->update($data);

        return redirect()->route('repartos.show', $reparto)
            ->with('success', 'Estado actualizado.');
    }

    /**
     * Asignar repartidor.
     */
    public function assignDriver(Request $request, Reparto $reparto): RedirectResponse
    {
        $request->validate([
            'repartidor_id' => 'required|exists:repartidores,id',
        ]);

        $reparto->update(['repartidor_id' => $request->input('repartidor_id')]);

        return redirect()->route('repartos.show', $reparto)
            ->with('success', 'Repartidor asignado.');
    }

    /**
     * Checkout del reparto: cobrar y completar pedido.
     */
    public function checkout(Request $request, Reparto $reparto): RedirectResponse
    {
        $request->validate([
            'monto_recibido' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $reparto) {
            $pedido = $reparto->pedido;
            $total = $pedido->detalles->sum(fn ($d) => $d->precio * $d->cantidad) + $reparto->costo_envio;

            $pedido->update([
                'estado' => 'completada',
                'monto_recibido' => $request->input('monto_recibido'),
                'vuelto' => $request->input('monto_recibido') - $total,
                'total' => $total,
            ]);

            $reparto->update([
                'estado' => 'entregado',
                'entregado_en' => now(),
            ]);
        });

        return redirect()->route('repartos.show', $reparto)
            ->with('success', 'Reparto cobrado exitosamente.');
    }
}

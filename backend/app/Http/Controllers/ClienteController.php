<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClienteFormRequest;
use App\Models\Cliente;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ClienteController extends Controller
{
    public function index(Request $request): View
    {
        $clientes = Cliente::orderBy('nombre')->get();
        return view('clientes.index', compact('clientes'));
    }

    public function create(): View
    {
        return view('clientes.create');
    }

    public function store(ClienteFormRequest $request): RedirectResponse
    {
        Cliente::create($request->validated());

        return redirect()->route('clientes.index')
            ->with('success', 'Cliente creado exitosamente.');
    }

    public function edit(Cliente $cliente): View
    {
        return view('clientes.edit', compact('cliente'));
    }

    public function update(ClienteFormRequest $request, Cliente $cliente): RedirectResponse
    {
        $cliente->update($request->validated());

        return redirect()->route('clientes.index')
            ->with('success', 'Cliente actualizado exitosamente.');
    }

    public function destroy(Cliente $cliente): RedirectResponse
    {
        // Integridad: no eliminar si tiene pedidos o repartos
        if ($cliente->pedidos()->count() > 0) {
            return redirect()->route('clientes.index')
                ->with('error', 'No se puede eliminar: el cliente tiene pedidos asociados.');
        }

        if ($cliente->repartos()->count() > 0) {
            return redirect()->route('clientes.index')
                ->with('error', 'No se puede eliminar: el cliente tiene repartos asociados.');
        }

        $cliente->delete();

        return redirect()->route('clientes.index')
            ->with('success', 'Cliente eliminado exitosamente.');
    }

    /**
     * Perfil 360 del cliente: gasto total, visitas, última compra, rango.
     */
    public function show(Cliente $cliente): View
    {
        $totalGastado = $cliente->pedidos()->where('estado', 'completada')->sum('total');
        $visitas = $cliente->pedidos()->where('estado', 'completada')->count();
        $ultimaCompra = $cliente->pedidos()->where('estado', 'completada')->latest('creado_en')->first();

        // Rango de fidelidad
        $rango = 'Nuevo';
        if ($totalGastado >= 5000) {
            $rango = 'Oro';
        } elseif ($totalGastado >= 2000) {
            $rango = 'Plata';
        } elseif ($totalGastado >= 500) {
            $rango = 'Bronce';
        }

        // Plato favorito
        $platoFavorito = $cliente->pedidos()
            ->where('estado', 'completada')
            ->with('detalles.producto')
            ->get()
            ->flatMap(fn ($p) => $p->detalles)
            ->groupBy('producto_id')
            ->map(fn ($d) => ['producto' => $d->first()->producto, 'cantidad' => $d->sum('cantidad')])
            ->sortByDesc('cantidad')
            ->first();

        return view('clientes.show', compact('cliente', 'totalGastado', 'visitas', 'ultimaCompra', 'rango', 'platoFavorito'));
    }
}
